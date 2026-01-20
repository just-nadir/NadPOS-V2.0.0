import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { X, Calendar, DollarSign, Loader2 } from 'lucide-react';

const ExtendLicenseModal = ({ isOpen, onClose, restaurant, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [currentLicense, setCurrentLicense] = useState(null);

    // Form data
    const [periodType, setPeriodType] = useState('months'); // months, days
    const [duration, setDuration] = useState(1);
    const [amount, setAmount] = useState(300000);

    useEffect(() => {
        if (isOpen && restaurant) {
            fetchCurrentLicense();
        }
    }, [isOpen, restaurant]);

    const fetchCurrentLicense = async () => {
        try {
            const res = await api.get(`/super-admin/license/${restaurant.id}`);
            setCurrentLicense(res.data);
        } catch (error) {
            console.error("Fetch License Error", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                restaurantId: restaurant.id,
                amount: amount,
                [periodType]: duration // months: 1 or days: 30
            };

            await api.post('/super-admin/license/extend', payload);
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            alert(error.response?.data?.error || "Xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                >
                    <X size={24} />
                </button>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Litsenziyani Uzaytirish</h2>
                    <p className="text-sm text-gray-500 mt-1">{restaurant?.name}</p>
                    {currentLicense && (
                        <div className={`mt-3 px-3 py-2 rounded-lg text-sm font-medium inline-block ${new Date(currentLicense.expires_at) < new Date()
                                ? 'bg-red-100 text-red-600'
                                : 'bg-green-100 text-green-600'
                            }`}>
                            Tugash sanasi: {new Date(currentLicense.expires_at).toLocaleDateString()}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Duration Type */}
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => { setPeriodType('months'); setDuration(1); setAmount(300000); }}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${periodType === 'months'
                                    ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`}
                        >
                            Oy
                        </button>
                        <button
                            type="button"
                            onClick={() => { setPeriodType('days'); setDuration(7); setAmount(0); }}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${periodType === 'days'
                                    ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`}
                        >
                            Kun
                        </button>
                    </div>

                    {/* Duration Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Muddat ({periodType === 'months' ? 'Oy' : 'Kun'})
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="number"
                                min="1"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                required
                            />
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            To'lov Summasi (UZS)
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="number"
                                min="0"
                                step="1000"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">To'lovlar tarixiga qo'shiladi</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Saqlash va Uzaytirish'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ExtendLicenseModal;
