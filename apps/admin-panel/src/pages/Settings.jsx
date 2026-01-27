import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Save, Shield, CreditCard, Globe, Server, User, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function Settings() {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({ phone: '', old_password: '', password: '', confirm_password: '' });

    // Plans State
    const [plans, setPlans] = useState([]);
    const [editingPlan, setEditingPlan] = useState(null); // null = list, {} = create/edit

    // Config State
    const [config, setConfig] = useState({ trial_days: 30, currency: 'UZS' });

    useEffect(() => {
        if (activeTab === 'plans') fetchPlans();
        if (activeTab === 'system') fetchConfig();
    }, [activeTab]);

    // --- PROFILE ---
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        if (profile.password && profile.password !== profile.confirm_password) {
            return alert("Parollar mos kelmadi");
        }
        try {
            setLoading(true);
            await api.put('/super-admin/profile', {
                phone: profile.phone,
                password: profile.password,
                old_password: profile.old_password
            });
            alert("Profil yangilandi! Qaytadan kirishingiz kerak bo'lishi mumkin.");
            setProfile({ phone: '', old_password: '', password: '', confirm_password: '' });
        } catch (error) {
            alert(error.response?.data?.error || "Xatolik");
        } finally {
            setLoading(false);
        }
    };

    // --- PLANS ---
    const fetchPlans = async () => {
        try {
            const res = await api.get('/super-admin/plans');
            setPlans(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSavePlan = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const id = editingPlan.id || 'new';
            await api.post(`/super-admin/plans/${id}`, editingPlan);
            setEditingPlan(null);
            fetchPlans();
            alert("Tarif saqlandi");
        } catch (error) {
            alert("Xatolik");
        } finally {
            setLoading(false);
        }
    };

    // --- SYSTEM ---
    const fetchConfig = async () => {
        try {
            const res = await api.get('/super-admin/config');
            setConfig(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSaveConfig = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.put('/super-admin/config', config);
            alert("Sozlamalar saqlandi");
        } catch (error) {
            alert("Xatolik");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tizim Sozlamalari</h1>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                        activeTab === 'profile'
                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    )}
                >
                    <User size={16} /> Profil
                </button>
                <button
                    onClick={() => setActiveTab('plans')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                        activeTab === 'plans'
                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    )}
                >
                    <CreditCard size={16} /> Tariflar
                </button>
                <button
                    onClick={() => setActiveTab('system')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                        activeTab === 'system'
                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    )}
                >
                    <Server size={16} /> Tizim
                </button>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">

                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                    <form onSubmit={handleProfileUpdate} className="max-w-md space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yangi Telefon Raqam (Opsional)</label>
                            <Input
                                placeholder="+998..."
                                value={profile.phone}
                                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                            />
                        </div>
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Parolni O'zgartirish</h3>
                            <div className="space-y-3">
                                <Input
                                    type="password"
                                    placeholder="Eski parol"
                                    value={profile.old_password}
                                    onChange={e => setProfile({ ...profile, old_password: e.target.value })}
                                />
                                <Input
                                    type="password"
                                    placeholder="Yangi parol"
                                    value={profile.password}
                                    onChange={e => setProfile({ ...profile, password: e.target.value })}
                                />
                                <Input
                                    type="password"
                                    placeholder="Parolni tasdiqlang"
                                    value={profile.confirm_password}
                                    onChange={e => setProfile({ ...profile, confirm_password: e.target.value })}
                                />
                            </div>
                        </div>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                        </Button>
                    </form>
                )}

                {/* PLANS TAB */}
                {activeTab === 'plans' && (
                    <div>
                        {!editingPlan ? (
                            <div className="space-y-4">
                                <div className="flex justify-end">
                                    <Button size="sm" onClick={() => setEditingPlan({ name: '', price: 0, currency: 'UZS', interval: 'month', is_active: true })}>
                                        <Plus size={16} className="mr-2" /> Yangi Tarif
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {plans.map(plan => (
                                        <div key={plan.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl relative group hover:border-blue-500 transition">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg">{plan.name}</h3>
                                                <span className={cn("px-2 py-0.5 rounded text-xs", plan.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                                                    {plan.is_active ? 'Active' : 'Hidden'}
                                                </span>
                                            </div>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {plan.price.toLocaleString()} <span className="text-sm text-gray-500">{plan.currency}/{plan.interval}</span>
                                            </p>
                                            <div className="mt-4 flex justify-end gap-2">
                                                <button onClick={() => setEditingPlan(plan)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                                    <Edit size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSavePlan} className="max-w-lg space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold">{editingPlan.id ? 'Tarifni Tahrirlash' : 'Yangi Tarif'}</h3>
                                    <button type="button" onClick={() => setEditingPlan(null)} className="text-gray-500 hover:text-gray-700"><X /></button>
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Nomi</label>
                                    <Input value={editingPlan.name} onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm mb-1">Narx</label>
                                        <Input type="number" value={editingPlan.price} onChange={e => setEditingPlan({ ...editingPlan, price: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1">Valyuta</label>
                                        <select
                                            className="w-full p-2 rounded-xl border bg-transparent"
                                            value={editingPlan.currency}
                                            onChange={e => setEditingPlan({ ...editingPlan, currency: e.target.value })}
                                        >
                                            <option value="UZS">UZS</option>
                                            <option value="USD">USD</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm mb-1">Davr</label>
                                        <select
                                            className="w-full p-2 rounded-xl border bg-transparent"
                                            value={editingPlan.interval}
                                            onChange={e => setEditingPlan({ ...editingPlan, interval: e.target.value })}
                                        >
                                            <option value="month">Oy</option>
                                            <option value="year">Yil</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center pt-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={editingPlan.is_active}
                                                onChange={e => setEditingPlan({ ...editingPlan, is_active: e.target.checked })}
                                            />
                                            <span>Aktiv</span>
                                        </label>
                                    </div>
                                </div>
                                <Button type="submit" disabled={loading} className="w-full">Saqlash</Button>
                            </form>
                        )}
                    </div>
                )}

                {/* SYSTEM TAB */}
                {activeTab === 'system' && (
                    <form onSubmit={handleSaveConfig} className="max-w-md space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sinov Muddati (Kun)</label>
                            <Input
                                type="number"
                                value={config.trial_days}
                                onChange={e => setConfig({ ...config, trial_days: e.target.value })}
                            />
                            <p className="text-xs text-gray-500 mt-1">Yangi ro'yxatdan o'tgan restoranlar uchun tekin kunlar soni.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asosiy Valyuta</label>
                            <select
                                className="w-full p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent"
                                value={config.currency}
                                onChange={e => setConfig({ ...config, currency: e.target.value })}
                            >
                                <option value="UZS">So'm (UZS)</option>
                                <option value="USD">Dollar (USD)</option>
                            </select>
                        </div>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                        </Button>
                    </form>
                )}

            </div>
        </div>
    );
}
