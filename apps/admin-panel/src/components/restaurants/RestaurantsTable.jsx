import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Shield, ShieldAlert, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { cn } from '../../lib/utils';
import api from '../../services/api';
import toast from 'react-hot-toast'; // We might need to install this or use simple alerts for now

const RestaurantsTable = ({ restaurants, onStatusChange, onExtend }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredRestaurants = restaurants.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.phone.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
        if (window.confirm(`Siz rostdan ham ushbu restoranni ${newStatus === 'blocked' ? 'bloklamoqchimisiz' : 'faollashtirmoqchimisiz'}?`)) {
            try {
                await api.put(`/super-admin/restaurants/${id}/status`, { status: newStatus });
                onStatusChange(); // Refresh data
            } catch (error) {
                console.error("Status change error", error);
                alert("Xatolik yuz berdi");
            }
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Filters Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Qidirish (Nomi, Email, Tel...)"
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Barcha Statuslar</option>
                        <option value="active">Faol</option>
                        <option value="blocked">Bloklangan</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-700">
                            <th className="p-5 font-medium">Restoran</th>
                            <th className="p-5 font-medium">Egasining Email</th>
                            <th className="p-5 font-medium">Telefon</th>
                            <th className="p-5 font-medium">Tarif</th>
                            <th className="p-5 font-medium">Muddati</th>
                            <th className="p-5 font-medium">Status</th>
                            <th className="p-5 font-medium text-right">Amallar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredRestaurants.length > 0 ? (
                            filteredRestaurants.map((r) => (
                                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group">
                                    <td className="p-5">
                                        <div className="font-semibold text-gray-800 dark:text-white">{r.name}</div>
                                        <div className="text-xs text-gray-400">ID: {r.id.substring(0, 8)}...</div>
                                    </td>
                                    <td className="p-5 text-gray-600 dark:text-gray-300">{r.owner}</td>
                                    <td className="p-5 text-gray-600 dark:text-gray-300">{r.phone}</td>
                                    <td className="p-5">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-lg text-xs font-semibold capitalize",
                                            r.plan === 'premium' ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" :
                                                r.plan === 'standard' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                                                    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                        )}>
                                            {r.plan}
                                        </span>
                                    </td>
                                    <td className="p-5 text-sm text-gray-600 dark:text-gray-300">
                                        {r.expires_at ? new Date(r.expires_at).toLocaleDateString() : 'Cheksiz'}
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            {r.status === 'active'
                                                ? <CheckCircle size={16} className="text-green-500" />
                                                : <XCircle size={16} className="text-red-500" />
                                            }
                                            <span className={cn(
                                                "text-sm font-medium capitalize",
                                                r.status === 'active' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                            )}>
                                                {r.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex items-center gap-2 justify-end">
                                            <button
                                                onClick={() => handleStatusToggle(r.id, r.status)}
                                                className={cn(
                                                    "p-2 rounded-lg transition opacity-0 group-hover:opacity-100",
                                                    r.status === 'active'
                                                        ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30"
                                                        : "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30"
                                                )}
                                                title={r.status === 'active' ? "Bloklash" : "Faollashtirish"}
                                            >
                                                {r.status === 'active' ? <ShieldAlert size={18} /> : <Shield size={18} />}
                                            </button>
                                            <button
                                                onClick={() => onExtend && onExtend(r)}
                                                className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 transition opacity-0 group-hover:opacity-100"
                                                title="Litsenziyani Uzaytirish"
                                            >
                                                <CreditCard size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="p-10 text-center text-gray-500">
                                    Hech qanday restoran topilmadi.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RestaurantsTable;
