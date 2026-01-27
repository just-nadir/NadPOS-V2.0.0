import React, { useState } from 'react';
import { Search, MoreVertical, Shield, User, MapPin, Phone, Lock, Eye, Ban } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import Skeleton from '../common/Skeleton';

const statusVariants = cva(
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
    {
        variants: {
            status: {
                active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                blocked: "bg-red-500/10 text-red-500 border-red-500/20",
                inactive: "bg-gray-500/10 text-gray-500 border-gray-500/20",
            },
        },
        defaultVariants: {
            status: "active",
        },
    }
);

const roleVariants = cva(
    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border",
    {
        variants: {
            role: {
                admin: "bg-blue-500/10 text-blue-500 border-blue-500/20",
                manager: "bg-purple-500/10 text-purple-500 border-purple-500/20",
                waiter: "bg-orange-500/10 text-orange-500 border-orange-500/20",
                cashier: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
            },
        },
        defaultVariants: {
            role: "waiter",
        },
    }
);

const UsersTable = ({ users, onEdit, onResetPassword, onBlock }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone.includes(searchTerm);
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between bg-surface/30 p-4 rounded-xl border border-white/5 mx-1">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Qidirish (Ism, Email, Tel...)"
                        className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="bg-background border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-primary/50"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="all">Barcha Rollar</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Menejer</option>
                    <option value="waiter">Ofitsiant</option>
                    <option value="cashier">Kassir</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-white/5 bg-surface/20 mx-1">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Foydalanuvchi</th>
                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Aloqa</th>
                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Rol</th>
                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Restoran</th>
                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Amallar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{user.name}</div>
                                                <div className="text-xs text-gray-500">ID: {user.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-sm font-medium text-white">
                                                <Phone size={12} className="text-gray-500" /> {user.phone}
                                            </div>
                                            {user.email && (
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    <span className="text-gray-600">@</span> {user.email}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={cn(roleVariants({ role: user.role }))}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-300">
                                            <MapPin size={14} className="text-gray-500" />
                                            {user.restaurant}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={cn(statusVariants({ status: user.status }))}>
                                            {user.status === 'active' ? <Shield size={12} /> : <Ban size={12} />}
                                            <span className="capitalize">{user.status}</span>
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                title="Parolni tiklash"
                                                onClick={() => onResetPassword(user)}
                                                className="p-1.5 rounded-lg text-yellow-500 hover:bg-yellow-500/10 transition-colors"
                                            >
                                                <Lock size={16} />
                                            </button>
                                            <button
                                                title="Bloklash"
                                                onClick={() => onBlock(user)}
                                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                                            >
                                                <Ban size={16} />
                                            </button>
                                            <button
                                                title="Ko'rish"
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">
                                    Hech narsa topilmadi
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersTable;
