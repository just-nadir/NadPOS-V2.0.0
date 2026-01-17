import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Store, UserCheck, DollarSign, Activity } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Skeleton from '../components/common/Skeleton';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState({ total_restaurants: 0, active_today: 0, mrr: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (error) {
            // Global handler
        } finally {
            setLoading(false);
        }
    };

    // Data from Backend
    const revenueData = stats.revenue_chart || [];
    const growthData = stats.growth_chart || [];

    if (loading) {
        return (
            <div>
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Boshqaruv Paneli</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Jami Restoranlar"
                    value={stats.total_restaurants}
                    icon={<Store className="text-blue-600 dark:text-blue-400" />}
                    color="bg-blue-100 dark:bg-blue-900/30"
                />
                <StatCard
                    title="Aktiv (Bugun)"
                    value={stats.active_today}
                    icon={<Activity className="text-green-600 dark:text-green-400" />}
                    color="bg-green-100 dark:bg-green-900/30"
                />
                <StatCard
                    title="Jami Userlar (Mock)"
                    value="150+"
                    icon={<UserCheck className="text-purple-600 dark:text-purple-400" />}
                    color="bg-purple-100 dark:bg-purple-900/30"
                />
                <StatCard
                    title="Oylik Daromad (MRR)"
                    value={`${(stats.mrr / 1000).toLocaleString()}K UZS`}
                    icon={<DollarSign className="text-yellow-600 dark:text-yellow-400" />}
                    color="bg-yellow-100 dark:bg-yellow-900/30"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6">Oylik Daromad</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6">Aktiv Restoranlar O'sishi</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData}>
                                <defs>
                                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Area type="monotone" dataKey="active" stroke="#10b981" fillOpacity={1} fill="url(#colorActive)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
