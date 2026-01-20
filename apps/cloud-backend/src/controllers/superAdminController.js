const prisma = require('../config/db');
const bcrypt = require('bcryptjs'); // Or 'bcrypt' depending on what's installed, trying bcryptjs common in express apps or just standard bcrypt check


// Get all restaurants with their owners
const getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await prisma.restaurant.findMany({
            include: {
                users: {
                    where: { role: 'admin' },
                    select: { email: true }
                },
                licenses: {
                    orderBy: { created_at: 'desc' },
                    take: 1
                }
            },
            orderBy: { created_at: 'desc' }
        });

        // Format data for frontend table
        const formatted = restaurants.map(r => ({
            id: r.id,
            name: r.name,
            owner: r.users[0]?.email || 'Noma\'lum',
            phone: r.phone || '-', // Phone is on Restaurant model
            status: r.status,
            expires_at: r.licenses?.[0]?.expires_at || r.expires_at || null, // Prioritize License table
            plan: r.plan
        }));

        res.json(formatted);
    } catch (error) {
        console.error('SuperAdmin Get All Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Block/Unblock Restaurant
const toggleBlockRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'active' or 'blocked'

        if (!['active', 'blocked'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updated = await prisma.restaurant.update({
            where: { id },
            data: { status }
        });

        res.json(updated);
    } catch (error) {
        console.error('SuperAdmin Block Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};


// Create New Restaurant
const createRestaurant = async (req, res) => {
    try {
        const { name, owner_name, email, password, phone, plan } = req.body;

        // Basic Validation
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ error: 'Barcha maydonlar to\'ldirilishi shart' });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Bu email allaqachon ro\'yxatdan o\'tgan' });
        }

        // Check if restaurant with same email exists
        const existingRestaurant = await prisma.restaurant.findUnique({ where: { email } });
        if (existingRestaurant) {
            return res.status(400).json({ error: 'Bu email bilan restoran allaqachon mavjud' });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Transaction: Create Restaurant & Owner User & Initial License
        const result = await prisma.$transaction(async (prisma) => {
            // 1. Create Restaurant
            const restaurant = await prisma.restaurant.create({
                data: {
                    name,
                    email, // Required by schema
                    phone,
                    status: 'active',
                    plan: plan || 'basic'
                    // expires_at removed
                }
            });

            // 2. Create User (Admin) linked to Restaurant
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: 'admin',
                    restaurant_id: restaurant.id
                }
            });

            // 3. Create Initial License (1 month free)
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);

            await prisma.license.create({
                data: {
                    key: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), // Random key
                    restaurant_id: restaurant.id,
                    expires_at: expiresAt,
                    status: 'active'
                }
            });

            return { restaurant, user };
        });

        res.status(201).json({ message: 'Restoran muvaffaqiyatli yaratildi', data: result });

    } catch (error) {
        console.error('SuperAdmin Create Error:', error);
        res.status(500).json({ error: error.message || 'Server Error' });
    }
};

// Get Dashboard Stats
const getStats = async (req, res) => {
    try {
        const total_restaurants = await prisma.restaurant.count();
        const active_today = await prisma.restaurant.count({ where: { status: 'active' } });

        // Calculate newly added restaurants in current month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const new_this_month = await prisma.restaurant.count({
            where: {
                created_at: {
                    gte: startOfMonth
                }
            }
        });

        // MRR Calculation (Mock logic based on plan)
        const restaurants = await prisma.restaurant.findMany({ select: { plan: true } });
        let mrr = 0;
        restaurants.forEach(r => {
            if (r.plan === 'basic') mrr += 100000;
            else if (r.plan === 'standard') mrr += 200000;
            else if (r.plan === 'premium') mrr += 300000;
        });

        // Mock Chart Data
        const revenue_chart = [
            { name: 'Jan', value: mrr * 0.8 },
            { name: 'Feb', value: mrr * 0.9 },
            { name: 'Mar', value: mrr * 0.95 },
            { name: 'Apr', value: mrr },
            { name: 'May', value: mrr * 1.1 },
            { name: 'Jun', value: mrr * 1.2 },
        ];

        const growth_chart = [
            { name: 'Jan', active: Math.max(0, total_restaurants - 5) },
            { name: 'Feb', active: Math.max(0, total_restaurants - 4) },
            { name: 'Mar', active: Math.max(0, total_restaurants - 2) },
            { name: 'Apr', active: total_restaurants },
        ];

        res.json({
            total_restaurants,
            active_today,
            new_this_month, // Newly added this month
            mrr, // Monthly Recurring Revenue
            revenue_chart,
            growth_chart
        });

    } catch (error) {
        console.error('SuperAdmin Stats Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Generate License Key Manually
const generateLicense = async (req, res) => {
    try {
        const { restaurantId, hwid, days } = req.body;
        const authService = require('../services/authService'); // Lazy require to avoid circular dep if any

        if (!restaurantId || !hwid) {
            return res.status(400).json({ error: 'Restaurant ID va HWID talab qilinadi' });
        }

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            include: { users: { where: { role: 'admin' } } }
        });

        if (!restaurant) {
            return res.status(404).json({ error: 'Restoran topilmadi' });
        }

        const adminUser = restaurant.users[0];
        if (!adminUser) {
            return res.status(400).json({ error: 'Restoran admini topilmadi' });
        }

        // Validity period
        const duration = days ? `${days}d` : '30d';

        // Update expires_at in DB for record keeping -> REMOVED because Restaurant model doesn't have expires_at
        // Only create License record
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (parseInt(days) || 30));

        // Wait, check if we need to update anything else on restaurant? No.
        // But we might want to update status to 'active' if it was blocked due to expiry?
        // Let's ensure status is active.
        await prisma.restaurant.update({
            where: { id: restaurantId },
            data: { status: 'active' }
        });

        const payload = {
            uid: adminUser.id,
            rid: restaurant.id,
            role: 'admin',
            plan: restaurant.plan,
            hwid: hwid
        };

        const token = authService.generateToken(payload, duration);

        // Also save license record
        await prisma.license.create({
            data: {
                key: token,
                restaurant_id: restaurant.id,
                hwid: hwid,
                expires_at: expiresAt,
                status: 'active'
            }
        });

        res.json({ token, expires_at: expiresAt });

    } catch (error) {
        console.error('Generate License Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Get All Payments
const getAllPayments = async (req, res) => {
    try {
        const payments = await prisma.payment.findMany({
            include: {
                restaurant: {
                    select: { name: true, phone: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        const formatted = payments.map(p => ({
            id: p.id,
            restaurant: p.restaurant?.name || 'O\'chirilgan',
            amount: p.amount,
            currency: p.currency,
            status: p.status,
            method: p.method,
            date: p.created_at
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Get Payments Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

module.exports = {
    getAllRestaurants,
    toggleBlockRestaurant,
    getStats,
    createRestaurant,
    generateLicense,
    getAllPayments
};
