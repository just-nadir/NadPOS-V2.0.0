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
        const formatted = restaurants.map(r => {
            const license = r.licenses?.[0];
            const expiresAt = license?.expires_at || r.expires_at || null;

            // Dinamik status: Agar muddati o'tgan bo'lsa, 'expired' deb qaytaraylik
            // Yoki 'blocked' agar admin bloklagan bo'lsa
            let dynamicStatus = r.status;
            if (dynamicStatus === 'active' && expiresAt && new Date(expiresAt) < new Date()) {
                dynamicStatus = 'expired';
            }

            return {
                id: r.id,
                name: r.name,
                owner: r.users[0]?.email || 'Noma\'lum',
                phone: r.phone || '-',
                payment_id: r.payment_id,
                status: dynamicStatus, // Use dynamic status
                expires_at: expiresAt,
                plan: r.plan
            };
        });

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

        // Validation
        if (!name || !password || !phone) {
            return res.status(400).json({ error: 'Nomi, telefon va parol kiritilishi shart' });
        }

        // Check if user exists (by phone)
        const existingUser = await prisma.user.findUnique({ where: { phone } });
        if (existingUser) {
            return res.status(400).json({ error: 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan' });
        }

        // Check if restaurant with same phone exists (optional, but good for data integrity)
        // Note: Restaurant email is also unique in schema, so if email provided, check it
        if (email) {
            const existingRestaurantEmail = await prisma.restaurant.findUnique({ where: { email } });
            if (existingRestaurantEmail) {
                return res.status(400).json({ error: 'Bu email bilan restoran allaqachon mavjud' });
            }
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Transaction: Create Restaurant & Owner User & Initial License
        const result = await prisma.$transaction(async (prisma) => {
            // 1. Create Restaurant
            const restaurant = await prisma.restaurant.create({
                data: {
                    name,
                    email: email || `${phone}@nadpos.uz`, // Auto-generate if missing
                    phone,
                    payment_id: Math.floor(100000 + Math.random() * 900000).toString(), // Generate 6 digit random number
                    status: 'active',
                    plan: plan || 'basic'
                }
            });

            // 2. Create User (Admin) linked to Restaurant
            const user = await prisma.user.create({
                data: {
                    phone,
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
                    key: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
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

// --- USER MANAGEMENT ---

// Get All Users
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                restaurant: {
                    select: { name: true, status: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        const formatted = users.map(u => ({
            id: u.id,
            name: u.restaurant?.name || 'Tizim',
            restaurant: u.restaurant?.name || '-', // Add explicit restaurant field
            phone: u.phone,
            email: u.email,
            role: u.role,
            status: u.restaurant?.status || 'active',
            created_at: u.created_at
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Get Users Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Block/Unblock User (Currently blocks their restaurant if they are admin)
const toggleBlockUser = async (req, res) => {
    // Note: Since User model doesn't have status, we assume we might block their restaurant 
    // OR we should add status to User. For now, let's just log it or handle via restaurant blocking if possible.
    // Frontend expects blocking user.
    // Variant 1: Agar user admin bo'lsa, uning restoranini bloklaymiz.
    try {
        const { id } = req.params;
        const { status } = req.body; // blocked, active

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.restaurant_id) {
            await prisma.restaurant.update({
                where: { id: user.restaurant_id },
                data: { status }
            });
            res.json({ message: 'User (Restaurant) status updated', status });
        } else {
            // Super admin or staff without restaurant logic
            res.status(400).json({ error: 'Cannot block this user type yet' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!password) return res.status(400).json({ error: 'New password required' });

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id },
            data: { password: hashedPassword }
        });

        res.json({ message: 'Parol muvaffaqiyatli yangilandi' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Dashboard Stats
const getStats = async (req, res) => {
    try {
        const total_restaurants = await prisma.restaurant.count();
        const active_today = await prisma.restaurant.count({ where: { status: 'active' } });

        // --- 1. New This Month ---
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const new_this_month = await prisma.restaurant.count({
            where: { created_at: { gte: startOfMonth } }
        });

        // --- 2. MRR (Real Revenue from Payments in last 30 days) ---
        // Yoki joriy oy tushumi desak to'g'riroq bo'ladi
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentPayments = await prisma.payment.findMany({
            where: {
                status: 'completed',
                created_at: { gte: thirtyDaysAgo }
            },
            select: { amount: true }
        });

        const mrr = recentPayments.reduce((sum, p) => sum + p.amount, 0);


        // --- 3. Revenue Chart (Last 6 Months) ---
        const revenue_chart = [];
        const growth_chart = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            date.setDate(1);
            date.setHours(0, 0, 0, 0);

            const nextMonth = new Date(date);
            nextMonth.setMonth(nextMonth.getMonth() + 1);

            const monthName = date.toLocaleString('default', { month: 'short' });

            // Revenue for this month
            const monthPayments = await prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    status: 'completed',
                    created_at: { gte: date, lt: nextMonth }
                }
            });

            // Growth (New Restaurants) for this month
            const newRestaurants = await prisma.restaurant.count({
                where: {
                    created_at: { gte: date, lt: nextMonth }
                }
            });

            revenue_chart.push({ name: monthName, value: monthPayments._sum.amount || 0 });
            growth_chart.push({ name: monthName, active: newRestaurants });
        }


        // --- 4. Recent Activity (Combined Logs) ---
        // So'nggi 5 to'lov
        const latPayments = await prisma.payment.findMany({
            take: 5,
            orderBy: { created_at: 'desc' },
            include: { restaurant: { select: { name: true } } }
        });

        // So'nggi 5 yangi restoran
        const latRestaurants = await prisma.restaurant.findMany({
            take: 5,
            orderBy: { created_at: 'desc' },
            select: { id: true, name: true, created_at: true }
        });

        // Combine and Sort
        let activities = [];

        latPayments.forEach(p => {
            activities.push({
                type: 'payment',
                title: p.restaurant?.name || 'Noma\'lum',
                desc: `${p.amount.toLocaleString()} UZS to'lov qildi`,
                amount: p.amount,
                time: p.created_at,
                status: 'success'
            });
        });

        latRestaurants.forEach(r => {
            activities.push({
                type: 'new_restaurant',
                title: r.name,
                desc: 'Tizimga yangi qo\'shildi',
                amount: 0,
                time: r.created_at,
                status: 'info'
            });
        });

        // Sort by time desc and take top 5
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        activities = activities.slice(0, 5);


        res.json({
            total_restaurants,
            active_today,
            new_this_month,
            mrr,
            revenue_chart,
            growth_chart,
            recent_activity: activities // Frontda buni ishlatish kerak
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

        // Litsenziya Kaliti (Short Random Key)
        const licenseKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const payload = {
            uid: adminUser.id,
            rid: restaurant.id,
            role: 'admin',
            plan: restaurant.plan,
            hwid: hwid,
            key: licenseKey // Payloadga kalitni qo'shamiz
        };

        const token = authService.generateToken(payload, duration);

        // Litsenziyani bazaga saqlash
        await prisma.license.create({
            data: {
                key: licenseKey, // Qisqa kalitni saqlaymiz
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

// Delete Restaurant (Danger Zone)
const deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        // Transaction to clean up everything
        await prisma.$transaction(async (prisma) => {
            // 1. Delete dependent data manually where Cascade is not set or to be safe
            await prisma.license.deleteMany({ where: { restaurant_id: id } });
            await prisma.user.deleteMany({ where: { restaurant_id: id } });
            await prisma.payment.deleteMany({ where: { restaurant_id: id } });

            // Sync data (Halls, Tables, etc.) usually have onDelete: Cascade in schema, 
            // but if not, we would need to delete them here too. 
            // Assuming Schema has Cascade for Hall, Table, Category, Product.

            // 2. Delete Restaurant
            await prisma.restaurant.delete({ where: { id } });
        });

        res.json({ message: 'Restoran va uning barcha ma\'lumotlari o\'chirildi' });
    } catch (error) {
        console.error('Delete Restaurant Error:', error);
        res.status(500).json({ error: 'O\'chirishda xatolik yuz berdi' });
    }
};

module.exports = {
    getAllRestaurants,
    toggleBlockRestaurant,
    getStats,
    createRestaurant,
    generateLicense,
    getAllPayments,
    deleteRestaurant,
    getAllUsers,
    toggleBlockUser,
    resetPassword,

    // --- SETTINGS ---

    // Update Profile (Self)
    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id; // From Auth Middleware
            const { phone, password, old_password } = req.body;

            const user = await prisma.user.findUnique({ where: { id: userId } });

            // Validate Old Password if changing password
            if (password) {
                if (!old_password) return res.status(400).json({ error: 'Eski parol kiritilishi shart' });
                const valid = await bcrypt.compare(old_password, user.password);
                if (!valid) return res.status(400).json({ error: 'Eski parol noto\'g\'ri' });
            }

            const data = {};
            if (phone) data.phone = phone;
            if (password) data.password = await bcrypt.hash(password, 10);

            await prisma.user.update({
                where: { id: userId },
                data
            });

            res.json({ message: 'Profil yangilandi' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get Plans
    getPlans: async (req, res) => {
        try {
            const plans = await prisma.plan.findMany({ orderBy: { price: 'asc' } });
            res.json(plans);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Update/Create Plan
    updatePlan: async (req, res) => {
        try {
            const { id } = req.params; // If "new", create
            const { name, price, currency, interval, features, is_active } = req.body;

            let plan;
            if (id === 'new') {
                plan = await prisma.plan.create({
                    data: { name, price: parseFloat(price), currency, interval, features, is_active }
                });
            } else {
                plan = await prisma.plan.update({
                    where: { id },
                    data: { name, price: parseFloat(price), currency, interval, features, is_active }
                });
            }
            res.json(plan);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get System Config
    getConfig: async (req, res) => {
        try {
            // Upsert ensures it always exists
            const config = await prisma.appConfig.upsert({
                where: { id: 'config' },
                update: {},
                create: { id: 'config' }
            });
            res.json(config);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Update System Config
    updateConfig: async (req, res) => {
        try {
            const { trial_days, currency } = req.body;
            const config = await prisma.appConfig.update({
                where: { id: 'config' },
                data: { trial_days: parseInt(trial_days), currency }
            });
            res.json(config);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Update Restaurant Plan
    updateRestaurantPlan: async (req, res) => {
        try {
            const { id } = req.params;
            const { plan } = req.body;

            await prisma.restaurant.update({
                where: { id },
                data: { plan }
            });

            res.json({ message: 'Tarif o\'zgartirildi' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};
