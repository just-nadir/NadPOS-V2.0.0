import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { X, Check } from 'lucide-react';
import api from '../../services/api';

const ChangePlanModal = ({ isOpen, onClose, restaurant, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchPlans();
            if (restaurant) setSelectedPlan(restaurant.plan);
        }
    }, [isOpen, restaurant]);

    const fetchPlans = async () => {
        try {
            const res = await api.get('/super-admin/plans');
            // Filter only active plans
            setPlans(res.data.filter(p => p.is_active));
        } catch (error) {
            console.error("Fetch plans error", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/super-admin/restaurants/${restaurant.id}/plan`, { plan: selectedPlan });
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Update plan error", error);
            alert("Xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Tarifni O'zgartirish</h2>
                <p className="text-sm text-gray-500 mb-6">"{restaurant?.name}" restorani uchun yangi tarifni tanlang.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        {plans.map((plan) => (
                            <label
                                key={plan.id}
                                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPlan === plan.name
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-100 dark:border-gray-700 hover:border-blue-200'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="plan"
                                        value={plan.name}
                                        checked={selectedPlan === plan.name}
                                        onChange={(e) => setSelectedPlan(e.target.value)}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <div>
                                        <div className="font-bold text-gray-800 dark:text-white">{plan.name}</div>
                                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                            {plan.price.toLocaleString()} {plan.currency}/{plan.interval}
                                        </div>
                                    </div>
                                </div>
                                {selectedPlan === plan.name && <Check className="text-blue-500" size={20} />}
                            </label>
                        ))}
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ChangePlanModal;
