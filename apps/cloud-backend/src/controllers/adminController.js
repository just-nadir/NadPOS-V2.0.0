const prisma = require('../config/db');
const authService = require('../services/authService');
const bcrypt = require('bcryptjs');

// 1. Get All Restaurants
const getRestaurants = async (req, res) => {
    try {
        const restaurants = await prisma.restaurant.findMany({
            include: {
                users: {
                    where: { role: 'admin' },
                    select: { email: true } // Faqat emailni olamiz
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

        // Random password for initial admin user
        const password = '123456';

        const { restaurant, user } = await authService.registerAdmin(email, password, name);

        // Update restaurant details
        await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: { phone, plan }
        });

        res.json({
            success: true,
            restaurant: restaurant,
            adminUser: { ...user, password } // Return plain password once
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
};

// 3. Update Status
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await prisma.restaurant.update({
            where: { id },
            data: { status }
        });

        res.json({ success: true, status: updated.status });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// 4. Get Stats
const getStats = async (req, res) => {
    try {
        const total = await prisma.restaurant.count();
        const premium = await prisma.restaurant.count({ where: { plan: 'premium' } });

        // MRR (Approx)
        let mrr = 0;
        const plans = await prisma.restaurant.groupBy({
            by: ['plan'],
            _count: { plan: true }
        });

        plans.forEach(p => {
            if (p.plan === 'premium') mrr += p._count.plan * 300000;
            else if (p.plan === 'standard') mrr += p._count.plan * 150000;
            else if (p.plan === 'basic') mrr += p._count.plan * 100000;
        });

        res.json({
            total_restaurants: total,
            active_today: 0, // TODO: Implement activity log
            mrr: mrr
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

module.exports = {
    getRestaurants,
    createRestaurant,
    updateStatus,
    getStats
};
