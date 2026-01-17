import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, User, Phone, Mail, CreditCard, Loader2, CheckCircle, XCircle } from 'lucide-react';

const Restaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        plan: 'standard'
    });
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const res = await api.get('/admin/restaurants');
            setRestaurants(res.data);
        } catch (error) {
            console.error("Error fetching restaurants:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            await api.post('/admin/create-restaurant', formData);
            setIsModalOpen(false);
            setFormData({ name: '', email: '', phone: '', plan: 'standard' });
            fetchRestaurants(); // Refresh list
        } catch (error) {
            alert('Xatolik yuz berdi');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Restoranlar</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                    <Plus size={20} />
                    Yangi Restoran
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {restaurants.length === 0 ? (
                        <div className="text-center p-8 bg-white rounded-lg text-gray-500">
                            Hozircha restoranlar yo'q
                        </div>
                    ) : (
                        restaurants.map((rest) => (
                            <div key={rest.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        {rest.name}
                                        <span className={`text-xs px-2 py-1 rounded-full ${rest.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {rest.status}
                                        </span>
                                    </h3>
                                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                        <span className="flex items-center gap-1"><Mail size={14} /> {rest.email}</span>
                                        <span className="flex items-center gap-1"><Phone size={14} /> {rest.phone}</span>
                                        <span className="flex items-center gap-1"><CreditCard size={14} /> {rest.plan?.toUpperCase()}</span>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-400 font-mono">ID: {rest.id}</div>
                                </div>
                                <div className="text-right">
                                    {/* Actions can be added here */}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Yangi Restoran Qo'shish</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Restoran Nomi</label>
                                <input
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Masalan: Rayhon Milliy Taomlar"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Login uchun)</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="admin@restaurant.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                <input
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+998 90 123 45 67"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tarif Rejasi</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.plan}
                                    onChange={e => setFormData({ ...formData, plan: e.target.value })}
                                >
                                    <option value="basic">Basic (100,000 UZS)</option>
                                    <option value="standard">Standard (150,000 UZS)</option>
                                    <option value="premium">Premium (300,000 UZS)</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={submitLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-4 flex justify-center items-center"
                            >
                                {submitLoading ? <Loader2 className="animate-spin" /> : "Yaratish & Litsenziya Berish"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Restaurants;
