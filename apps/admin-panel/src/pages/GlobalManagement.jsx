import React, { useState, useEffect } from 'react';
import superAdminService from '../services/superAdminService';
import { toast } from 'react-hot-toast';
import { Search, Shield, Ban, CheckCircle, Clock } from 'lucide-react';

const GlobalManagement = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await superAdminService.getAllRestaurants();
            setRestaurants(data);
        } catch (error) {
            console.error(error);
            toast.error("Ma'lumotlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
        if (!window.confirm(`Haqiqatdan ham bu restoranni ${newStatus === 'blocked' ? 'bloklamoqchimisiz' : 'aktivlashtirmoqchimisiz'}?`)) return;

        try {
            await superAdminService.toggleStatus(id, newStatus);
            toast.success(`Restoran ${newStatus === 'blocked' ? 'bloklandi' : 'aktivlashtirildi'}`);
            fetchData(); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error("Statusni o'zgartirishda xatolik");
        }
    };

    const filtered = restaurants.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone?.includes(searchTerm) ||
        r.owner.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Yuklanmoqda...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent flex items-center gap-2">
                        <Shield /> Global Boshqaruv (Super Admin)
                    </h1>
                    <p className="text-gray-500">Barcha restoranlar nazorati</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Restoran nomi, egasi yoki telefon orqali qidirish..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-200 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Restoran</th>
                            <th className="p-4 font-semibold text-gray-600">Egasi</th>
                            <th className="p-4 font-semibold text-gray-600">Plan</th>
                            <th className="p-4 font-semibold text-gray-600">Holati</th>
                            <th className="p-4 font-semibold text-gray-600">Amallar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.map(r => (
                            <tr key={r.id} className="hover:bg-gray-50 transition">
                                <td className="p-4">
                                    <div className="font-semibold text-gray-800">{r.name}</div>
                                    <div className="text-sm text-gray-400 text-xs">{r.id}</div>
                                </td>
                                <td className="p-4">
                                    <div className="text-gray-800">{r.owner}</div>
                                    <div className="text-sm text-gray-500">{r.phone}</div>
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-semibold uppercase border border-blue-100">
                                        {r.plan || 'Free'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {r.status === 'active' ? (
                                        <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-sm w-fit">
                                            <CheckCircle size={14} /> Aktiv
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-sm w-fit">
                                            <Ban size={14} /> Bloklangan
                                        </span>
                                    )}
                                </td>
                                <td className="p-4">
                                    {r.status === 'active' ? (
                                        <button
                                            onClick={() => handleToggleStatus(r.id, 'active')}
                                            className="text-red-500 hover:bg-red-50 px-3 py-1 rounded border border-red-200 text-sm font-medium transition"
                                        >
                                            Bloklash
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleToggleStatus(r.id, 'blocked')}
                                            className="text-green-600 hover:bg-green-50 px-3 py-1 rounded border border-green-200 text-sm font-medium transition"
                                        >
                                            Aktivlashtirish
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="p-8 text-center text-gray-400">Hech narsa topilmadi</div>
                )}
            </div>
        </div>
    );
};

export default GlobalManagement;
