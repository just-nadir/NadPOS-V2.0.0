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
            expires_at: r.expires_at || 'Cheksiz', // license expiry logic if exists
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

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Transaction: Create Restaurant & Owner User
        const result = await prisma.$transaction(async (prisma) => {
            // 1. Create Restaurant
            const restaurant = await prisma.restaurant.create({
                data: {
                    name,
                    phone, // Assuming phone is on Restaurant model based on getAllRestaurants
                    status: 'active',
                    plan: plan || 'basic',
                    expires_at: new Date(new Date().setMonth(new Date().getMonth() + 1)) // 1 month free
                }
            });

            // 2. Create User (Admin) linked to Restaurant
            const user = await prisma.user.create({
                data: {
                    name: owner_name || 'Admin',
                    email,
                    password: hashedPassword,
                    role: 'admin',
                    phone,
                    restaurant_id: restaurant.id
                }
            });

            return { restaurant, user };
        });

        res.status(201).json({ message: 'Restoran muvaffaqiyatli yaratildi', data: result });

    } catch (error) {
        console.error('SuperAdmin Create Error:', error);
        res.status(500).json({ error: 'Server Error' });
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

module.exports = {
    getAllRestaurants,
    toggleBlockRestaurant,
    getStats,
    createRestaurant
};
