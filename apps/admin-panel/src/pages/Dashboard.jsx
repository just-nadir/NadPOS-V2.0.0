import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Store, UserCheck, DollarSign, Activity } from 'lucide-react';

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
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Boshqaruv Paneli</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Jami Restoranlar"
                    value={stats.total_restaurants}
                    icon={<Store className="text-blue-600" />}
                    color="bg-blue-100"
                />
                <StatCard
                    title="Aktiv (Bugun)"
                    value={stats.active_today}
                    icon={<Activity className="text-green-600" />}
                    color="bg-green-100"
                />
                <StatCard
                    title="Jami Userlar (Mock)"
                    value="150+"
                    icon={<UserCheck className="text-purple-600" />}
                    color="bg-purple-100"
                />
                <StatCard
                    title="Oylik Daromad (MRR)"
                    value={`${(stats.mrr / 1000).toFixed(0)}K UZS`}
                    icon={<DollarSign className="text-yellow-600" />}
                    color="bg-yellow-100"
                />
            </div>

            {/* Recent Activity chart placeholder */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Oxirgi Faolliklar</h3>
                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                    Grafiklar bu yerda bo'ladi
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 hover:shadow-md transition">
        <div className={`p-4 rounded-lg ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
    </div>
);

export default Dashboard;
