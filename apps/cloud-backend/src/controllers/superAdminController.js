const prisma = require('../config/db');

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

module.exports = {
    getAllRestaurants,
    toggleBlockRestaurant
};
