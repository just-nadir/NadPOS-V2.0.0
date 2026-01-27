import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, Users, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../../services/api';
import Skeleton from '../../components/common/Skeleton';

const StatCard = ({ title, value, icon: Icon, trend, color = "blue" }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400`}>
                <Icon size={24} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
);

const RestaurantDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/restaurant/stats');
            setStats(res.data);
        } catch (error) {
            console.error("Dashboard Stats Error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-white">Yuklanmoqda...</div>; // TODO: Better skeleton
    }

    // Dummy chart data if no history yet
    const chartData = [
        { name: 'Du', value: 4000 },
        { name: 'Se', value: 3000 },
        { name: 'Ch', value: 2000 },
        { name: 'Pa', value: 2780 },
        { name: 'Ju', value: 1890 },
        { name: 'Sh', value: 2390 },
        { name: 'Ya', value: 3490 },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Boshqaruv Paneli</h1>
                <p className="text-gray-500 text-sm">Bugungi kun statistikasi va ko'rsatkichlari.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Jami Savdo (Bugun)"
                    value={`${stats?.sales_today?.toLocaleString()} UZS`}
                    icon={DollarSign}
                    color="green"
                    trend={12}
                />
                <StatCard
                    title="Buyurtmalar"
                    value={stats?.orders_today}
                    icon={ShoppingBag}
                    color="blue"
                    trend={5}
                />
                <StatCard
                    title="Aktiv Stollar"
                    value={stats?.active_tables}
                    icon={Users}
                    color="purple"
                />
                <StatCard
                    title="O'rtacha Chek"
                    value={`${stats?.orders_today ? Math.round(stats.sales_today / stats.orders_today).toLocaleString() : 0} UZS`}
                    icon={Clock}
                    color="orange"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Savdolar Dinamikasi</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">So'nggi Buyurtmalar</h3>
                    <div className="space-y-4">
                        {stats?.recent_orders?.length > 0 ? (
                            stats.recent_orders.map((order) => (
                                <div key={order.id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                            #{order.id.substring(0, 2)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-white">{order.items_count} ta mahsulot</p>
                                            <p className="text-xs text-gray-500">{new Date(order.time).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-800 dark:text-white">{order.total.toLocaleString()}</p>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 capitalize">{order.status}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">Buyurtmalar yo'q</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantDashboard;
