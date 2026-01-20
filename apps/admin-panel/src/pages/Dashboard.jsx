import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Store, UserCheck, DollarSign, Activity, TrendingUp, Calendar, PlusCircle } from 'lucide-react';
import ModernStatCard from '../components/dashboard/ModernStatCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import Skeleton from '../components/common/Skeleton';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total_restaurants: 0, active_today: 0, mrr: 0, new_this_month: 0, revenue_chart: [], growth_chart: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/super-admin/stats');
            setStats(res.data);
        } catch (error) {
            console.error("Dashboard Stats Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const revenueData = stats.revenue_chart || [];
    const growthData = stats.growth_chart || [];

    if (loading) {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-8">
                <Skeleton className="h-12 w-64 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
                    <Skeleton className="h-96 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">Xush kelibsiz 👋</h1>
                    <p className="text-gray-500 dark:text-gray-400">Biznesingizning bugungi holati.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm font-medium text-sm">
                        <Calendar size={18} />
                        <span>Bugun</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition font-medium text-sm">
                        <PlusCircle size={18} />
                        <span>Restoran Qo'shish</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ModernStatCard
                    title="Jami Mijozlar"
                    value={stats.total_restaurants}
                    icon={<Store size={24} />}
                    color="blue"
                    trend="up"
                    trendValue="Jami ro'yxatdan o'tgan"
                    delay={100}
                    onClick={() => navigate('/restaurants')}
                />
                <ModernStatCard
                    title="Aktiv Mijozlar"
                    value={stats.active_today}
                    icon={<Activity size={24} />}
                    color="emerald"
                    trend="up"
                    trendValue="Hozir ishlayotgan"
                    delay={200}
                    onClick={() => navigate('/restaurants')}
                />
                <ModernStatCard
                    title="Oylik Daromad"
                    value={`${(stats.mrr / 1000000).toFixed(1)}M UZS`}
                    icon={<DollarSign size={24} />}
                    color="amber"
                    trend="up"
                    trendValue="Kutilayotgan tushum"
                    delay={300}
                    onClick={() => navigate('/payments')}
                />
                <ModernStatCard
                    title="Yangi Qo'shilganlar"
                    value={stats.new_this_month || 0}
                    icon={<UserCheck size={24} />}
                    color="purple"
                    trend="up"
                    trendValue="Bu oyda"
                    delay={400}
                    onClick={() => navigate('/restaurants')}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (Charts) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Revenue Chart */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Daromad O'sishi</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">SaaS Obunalardan tushum</p>
                            </div>
                            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <TrendingUp className="text-blue-500" size={20} />
                            </div>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(value) => `${value / 1000000}M`}
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                        }}
                                        formatter={(value) => [`${value.toLocaleString()} UZS`, 'Daromad']}
                                        cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Growth Chart */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Mijozlar Bazasi</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Yangi qo'shilgan restoranlar</p>
                            </div>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={growthData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                    <Bar dataKey="active" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Right Column (Activity & Quick Actions) */}
                <div className="space-y-6">
                    {/* Quick Access Card */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
                        <h3 className="text-xl font-bold mb-2">Litsenziya Sotish</h3>
                        <p className="text-indigo-100 text-sm mb-6">Yangi restoran uchun litsenziya kalitini generatsiya qilish.</p>
                        <button className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition shadow-sm">
                            Kalit Yaratish
                        </button>
                    </div>

                    {/* Recent Activity */}
                    <RecentActivity />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
