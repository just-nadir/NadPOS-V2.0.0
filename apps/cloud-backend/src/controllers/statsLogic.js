// ... imports

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

        // Growth Chart Data (Last 6 months)
        // Since we don't have a separate 'history' table, we will group by created_at.
        // For cumulative active growth, we count how many existed at end of each month.

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1); // Start of that month

        const restaurants = await prisma.restaurant.findMany({
            select: { created_at: true, plan: true },
            orderBy: { created_at: 'asc' }
        });

        const chartLabels = getLast6Months();
        const growthData = [];
        const revenueData = [];

        // Simple loop to calculate cumulative stats for each of the last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const year = date.getFullYear();
            const month = date.getMonth();

            // End of this month
            const endOfMonth = new Date(year, month + 1, 0);

            // Filter restaurants created before this date
            const existing = restaurants.filter(r => new Date(r.created_at) <= endOfMonth);

            growthData.push({
                name: date.toLocaleString('default', { month: 'short' }),
                active: existing.length
            });

            // Calculate estimated revenue for that month
            let monthlyRevenue = 0;
            existing.forEach(r => {
                if (r.plan === 'premium') monthlyRevenue += 300000;
                else if (r.plan === 'standard') monthlyRevenue += 150000;
                else if (r.plan === 'basic') monthlyRevenue += 100000;
            });

            revenueData.push({
                name: date.toLocaleString('default', { month: 'short' }),
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
