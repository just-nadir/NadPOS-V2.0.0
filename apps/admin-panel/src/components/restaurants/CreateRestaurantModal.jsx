import React, { useState } from 'react';
import { X, Save, Key, User, Phone, Mail, Store, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { cn } from '../../lib/utils';

const CreateRestaurantModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        owner_name: '',
        email: '',
        password: '',
        phone: '',
        plan: 'basic'
    });
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/super-admin/restaurants', formData);
            onSuccess();
            onClose();
            setFormData({ name: '', owner_name: '', email: '', password: '', phone: '', plan: 'basic' });
        } catch (err) {
            setError(err.response?.data?.error || 'Xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Yangi Restoran</h2>
                    <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 transition">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            required
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Restoran Nomi"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                name="owner_name"
                                value={formData.owner_name}
                                onChange={handleChange}
                                placeholder="Egasining Ismi"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+998..."
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            required
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email (Admin Login)"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>

                    <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            required
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Parol"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">Tarif Rejasi</label>
                        <select
                            name="plan"
                            value={formData.plan}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none"
                        >
                            <option value="basic">Basic</option>
                            <option value="standard">Standard</option>
                            <option value="premium">Premium</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        <span>Saqlash</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateRestaurantModal;
