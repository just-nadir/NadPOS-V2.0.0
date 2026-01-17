const prisma = require('../config/db');
const authService = require('../services/authService');
const bcrypt = require('bcryptjs');

// Helper for Auditing
const logAction = async (req, action, details) => {
    try {
        // req.user comes from authMiddleware (decoded token)
        const email = req.user ? req.user.email : 'system';
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        await prisma.auditLog.create({
            data: {
                user_email: email,
                action,
                details: details || {},
                ip_address: typeof ip === 'string' ? ip : JSON.stringify(ip)
            }
        });
    } catch (e) {
        console.error('Audit Log Error:', e);
    }
};

// 0. Login (Wrapper for Admin Panel)
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);

        // Check if admin
        if (result.user.role !== 'admin' && result.user.role !== 'super_admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Log login
        // Note: req.user is not set yet, so we pass email directly or handle in logAction if we passed email
        // But for consistency let's just log manually here
        await prisma.auditLog.create({
            data: { user_email: email, action: 'ADMIN_LOGIN', ip_address: req.ip }
        });

        res.json(result);
    } catch (e) {
        res.status(401).json({ error: e.message });
    }
};

// 1. Get All Restaurants
const getRestaurants = async (req, res) => {
    try {
        const restaurants = await prisma.restaurant.findMany({
            include: {
                users: {
                    where: { role: 'admin' },
                    select: { email: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(restaurants);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// 2. Create Restaurant
const createRestaurant = async (req, res) => {
    try {
        const { name, email, phone, plan } = req.body;
        const password = '123456'; // Default

        const { restaurant, user } = await authService.registerAdmin(email, password, name);

        await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: { phone, plan }
        });

        await logAction(req, 'CREATE_RESTAURANT', { name, email, plan });

        res.json({
            success: true,
            restaurant: restaurant,
            adminUser: { ...user, password }
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
};

// 3. Update Status (Block/Unblock)
const updateRestaurantStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // active, blocked

        const updated = await prisma.restaurant.update({
            where: { id },
            data: { status }
        });

        await logAction(req, 'UPDATE_STATUS', { restaurant_id: id, status });

        res.json({ success: true, status: updated.status });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// 4. Update Restaurant Info
const updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, plan } = req.body;

        const updated = await prisma.restaurant.update({
            where: { id },
            data: { name, phone, plan }
        });

        await logAction(req, 'UPDATE_RESTAURANT', { restaurant_id: id, changes: { name, phone, plan } });

        res.json({ success: true, restaurant: updated });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// 5. Reset Restaurant Password
const resetRestaurantPassword = async (req, res) => {
    try {
        const { id } = req.params; // Restaurant ID
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Password too short' });
        }

        // Find admin user of this restaurant
        const adminUser = await prisma.user.findFirst({
            where: { restaurant_id: id, role: 'admin' }
        });

        if (!adminUser) return res.status(404).json({ error: 'Admin user not found for this restaurant' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: adminUser.id },
            data: { password: hashedPassword }
        });

        await logAction(req, 'RESET_PASSWORD', { restaurant_id: id, admin_email: adminUser.email });

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// 6. Change Super Admin Password
const changeAdminPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId; // From token

        // Verify current
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) return res.status(400).json({ error: 'Incorrect current password' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        await logAction(req, 'CHANGE_ADMIN_PASSWORD', {});

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// 7. Get Logs
const getLogs = async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { created_at: 'desc' },
            take: 100
        });
        res.json(logs);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// 8. Get Payments
const getPayments = async (req, res) => {
    try {
        const payments = await prisma.payment.findMany({
            include: { restaurant: { select: { name: true } } },
            orderBy: { created_at: 'desc' }
        });
        res.json(payments);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// Helper to get last 6 months
const getLast6Months = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push(d.toLocaleString('default', { month: 'short' }));
    }
    return months;
};

// 9. Get Stats (Real Data)
const getStats = async (req, res) => {
    try {
        const total = await prisma.restaurant.count();
        const activeToday = await prisma.restaurant.count({ where: { status: 'active' } });

        // Calculate MRR based on active plans
        const plans = await prisma.restaurant.groupBy({
            by: ['plan'],
            _count: { plan: true },
            where: { status: 'active' }
        });

        let mrr = 0;
        plans.forEach(p => {
            if (p.plan === 'premium') mrr += p._count.plan * 300000;
            else if (p.plan === 'standard') mrr += p._count.plan * 150000;
            else if (p.plan === 'basic') mrr += p._count.plan * 100000;
        });

        // Growth & Revenue Chart Data (Last 6 months)
        const restaurants = await prisma.restaurant.findMany({
            select: { created_at: true, plan: true, status: true },
            orderBy: { created_at: 'asc' }
        });

        const growthData = [];
        const revenueData = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const year = date.getFullYear();
            const month = date.getMonth();

            // End of this month
            const endOfMonth = new Date(year, month + 1, 0);
            const monthName = date.toLocaleString('default', { month: 'short' });

            // Filter restaurants created before end of this month
            // For revenue, we assume all active restaurants at that time were paying
            // Ideally we should check if they were active back then, but status is current.
            // Improved logic: Count all created <= endOfMonth as 'Active' for that month if status is not blocked NOW?
            // Approximation: Count all created <= endOfMonth.

            const existing = restaurants.filter(r => new Date(r.created_at) <= endOfMonth);

            growthData.push({
                name: monthName,
                active: existing.length
            });

            let monthlyRevenue = 0;
            existing.forEach(r => {
                // Approximate revenue based on plan
                if (r.plan === 'premium') monthlyRevenue += 300000;
                else if (r.plan === 'standard') monthlyRevenue += 150000;
                else if (r.plan === 'basic') monthlyRevenue += 100000;
            });

            revenueData.push({
                name: monthName,
                value: monthlyRevenue / 1000 // In K UZS
            });
        }

        res.json({
            total_restaurants: total,
            active_today: activeToday,
            mrr: mrr,
            revenue_chart: revenueData,
            growth_chart: growthData
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
};

module.exports = {
    login,
    getRestaurants,
    createRestaurant,
    updateRestaurant,
    updateRestaurantStatus,
    resetRestaurantPassword,
    changeAdminPassword,
    getLogs,
    getPayments,
    getStats
};
