const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboardStats = async (req, res) => {
    try {
        const restaurantId = req.user.restaurantId;

        // 1. Total Sales (All time)
        const totalSales = await prisma.payment.aggregate({
            where: { restaurant_id: restaurantId, status: 'completed' },
            _sum: { amount: true }
        });

        // 2. Orders Today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const ordersToday = await prisma.order.count({
            where: {
                restaurant_id: restaurantId,
                created_at: { gte: startOfDay }
            }
        });

        // 3. Sales Today (from Payment or Order items if payment logic is complex)
        // Assuming Payments track real money
        const salesToday = await prisma.payment.aggregate({
            where: {
                restaurant_id: restaurantId,
                status: 'completed',
                created_at: { gte: startOfDay }
            },
            _sum: { amount: true }
        });

        // 4. Active Tables
        const activeTables = await prisma.table.count({
            where: { restaurant_id: restaurantId, status: 'occupied' }
        });

        // 5. Recent Orders (Last 5)
        const recentOrders = await prisma.order.findMany({
            where: { restaurant_id: restaurantId },
            include: { items: true },
            orderBy: { created_at: 'desc' },
            take: 5
        });

        // 6. Chart Data (Last 7 days)
        const chartData = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);

            const nextDay = new Date(d);
            nextDay.setDate(d.getDate() + 1);

            const dailySales = await prisma.payment.aggregate({
                where: {
                    restaurant_id: restaurantId,
                    status: 'completed',
                    created_at: {
                        gte: d,
                        lt: nextDay
                    }
                },
                _sum: { amount: true }
            });

            // Format stats: Mon, Tue etc. or just date
            const dayName = d.toLocaleDateString('uz-UZ', { weekday: 'short' });
            chartData.push({
                name: dayName,
                value: dailySales._sum.amount || 0
            });
        }

        res.json({
            total_sales: totalSales._sum.amount || 0,
            sales_today: salesToday._sum.amount || 0,
            orders_today: ordersToday,
            active_tables: activeTables,
            chart_data: chartData,
            recent_orders: recentOrders.map(o => ({
                id: o.id,
                total: o.total_amount,
                status: o.status,
                items_count: o.items.length,
                time: o.created_at
            }))
        });

    } catch (error) {
        console.error('Restaurant Dashboard Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

module.exports = {
    getDashboardStats
};
