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
    Bar
} from 'recharts';
import { useNavigate } from 'react-router-dom';

import LicenseGeneratorModal from '../components/dashboard/LicenseGeneratorModal';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total_restaurants: 0, active_today: 0, mrr: 0, new_this_month: 0, revenue_chart: [], growth_chart: [] });
    const [loading, setLoading] = useState(true);
    const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);

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
            <div className="space-y-8">
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
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">Xush kelibsiz 👋</h1>
                    <p className="text-gray-500 dark:text-gray-400">Biznesingizning bugungi holati.</p>
                </div>
                <div className="flex gap-3">
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
                    value={`${stats.mrr?.toLocaleString('ru-RU')} UZS`}
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
                        <div className="h-80 min-h-[320px] w-full">
                            {revenueData.length > 0 ? (
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
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">Ma'lumot yo'q</div>
                            )}
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
                        <div className="h-64 min-h-[256px] w-full">
                            {growthData.length > 0 ? (
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
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">Ma'lumot yo'q</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column (Activity & Quick Actions) */}
                <div className="space-y-6">
                    {/* Quick Access Card */}
                    {/* Quick Access Card removed by request */}

                    {/* Recent Activity */}
                    <RecentActivity activities={stats.recent_activity || []} />
                </div>
            </div>

            <LicenseGeneratorModal
                isOpen={isLicenseModalOpen}
                onClose={() => setIsLicenseModalOpen(false)}
            />
        </div>
    );
};

export default Dashboard;
