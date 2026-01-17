import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Lock, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const { logout } = useAuth();
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(false); // TODO: Get from context or LS

    const toggleDarkMode = () => {
        if (darkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        }
        setDarkMode(!darkMode);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error("Parollar mos kelmadi");
        }
        if (passwordData.newPassword.length < 6) {
            return toast.error("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
        }

        setLoading(true);
        try {
            await api.post('/admin/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success("Parol muvaffaqiyatli o'zgartirildi");
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            // Error handling is global
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Sozlamalar</h1>

            <div className="grid gap-6">
                {/* Appearance */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        <Sun className="w-5 h-5" /> Ko'rinish
                    </h2>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Tungi rejim (Dark Mode)</span>
                        <button
                            onClick={toggleDarkMode}
                            className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                    </div>
                </div>

                {/* Password */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                        <Lock className="w-5 h-5" /> Admin Parolini O'zgartirish
                    </h2>
                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Joriy Parol</label>
                            <input
                                type="password"
                                required
                                className="w-full border dark:border-gray-600 rounded-lg px-4 py-2 dark:bg-gray-700 dark:text-white"
                                value={passwordData.currentPassword}
                                onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yangi Parol</label>
                            <input
                                type="password"
                                required
                                className="w-full border dark:border-gray-600 rounded-lg px-4 py-2 dark:bg-gray-700 dark:text-white"
                                value={passwordData.newPassword}
                                onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yangi Parolni Tasdiqlang</label>
                            <input
                                type="password"
                                required
                                className="w-full border dark:border-gray-600 rounded-lg px-4 py-2 dark:bg-gray-700 dark:text-white"
                                value={passwordData.confirmPassword}
                                onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
                        >
                            {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
