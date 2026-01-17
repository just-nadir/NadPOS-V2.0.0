import React, { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Mail, Phone, CreditCard, Loader2, Edit, Ban, CheckCircle, Key, Trash2, Search } from 'lucide-react';
import Modal from '../components/common/Modal';
import Skeleton from '../components/common/Skeleton';

const Restaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals state
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);

    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Filter
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        plan: 'standard'
    });

    const [passwordData, setPasswordData] = useState('');

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const res = await api.get('/admin/restaurants');
            setRestaurants(res.data);
        } catch (error) {
            // Global handler
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/admin/create-restaurant', formData);
            toast.success("Restoran muvaffaqiyatli yaratildi");
            setCreateModalOpen(false);
            setFormData({ name: '', email: '', phone: '', plan: 'standard' });
            fetchRestaurants();
        } catch (error) {
            // Global handler
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put(`/admin/restaurants/${selectedRestaurant.id}`, formData);
            toast.success("Ma'lumotlar yangilandi");
            setEditModalOpen(false);
            fetchRestaurants();
        } catch (error) {
            // Global handler
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
        if (!window.confirm(`Haqiqatdan ham bu restoranni ${newStatus === 'blocked' ? 'bloklamoqchimisiz' : 'aktivlashtirmoqchimisiz'}?`)) return;

        try {
            await api.patch(`/admin/restaurants/${id}/status`, { status: newStatus });
            toast.success(`Status o'zgartirildi: ${newStatus}`);
            fetchRestaurants();
        } catch (error) {
            // Global handler
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post(`/admin/restaurants/${selectedRestaurant.id}/reset-password`, { newPassword: passwordData });
            toast.success("Parol yangilandi");
            setPasswordModalOpen(false);
            setPasswordData('');
        } catch (error) {
            // Global handler
        } finally {
            setSubmitting(false);
        }
    };

    const openEditModal = (rest) => {
        setSelectedRestaurant(rest);
        setFormData({ name: rest.name, email: rest.email, phone: rest.phone || '', plan: rest.plan });
        setEditModalOpen(true);
    };

    const openPasswordModal = (rest) => {
        setSelectedRestaurant(rest);
        setPasswordModalOpen(true);
    };

    const filteredRestaurants = restaurants.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Restoranlar</h1>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Qidirish..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition whitespace-nowrap"
                    >
                        <Plus size={20} />
                        <span className="hidden md:inline">Yangi Restoran</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-4">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredRestaurants.length === 0 ? (
                        <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400">
                            Restoranlar topilmadi
                        </div>
                    ) : (
                        filteredRestaurants.map((rest) => (
                            <div key={rest.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                        {rest.name}
                                        <span className={`text-xs px-2 py-1 rounded-full border ${rest.status === 'active'
                                                ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                                : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                                            }`}>
                                            {rest.status.toUpperCase()}
                                        </span>
                                    </h3>
                                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1"><Mail size={14} /> {rest.email}</span>
                                        <span className="flex items-center gap-1"><Phone size={14} /> {rest.phone || '-'}</span>
                                        <span className="flex items-center gap-1"><CreditCard size={14} /> {rest.plan?.toUpperCase()}</span>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-400 font-mono">ID: {rest.id}</div>
                                </div>

                                <div className="flex gap-2 w-full md:w-auto">
                                    <button
                                        onClick={() => openEditModal(rest)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                        title="Tahrirlash"
                                    >
                                        <Edit size={20} />
                                    </button>
                                    <button
                                        onClick={() => openPasswordModal(rest)}
                                        className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition"
                                        title="Parolni tiklash"
                                    >
                                        <Key size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(rest.id, rest.status)}
                                        className={`p-2 rounded-lg transition ${rest.status === 'active'
                                                ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                            }`}
                                        title={rest.status === 'active' ? "Bloklash" : "Aktivlashtirish"}
                                    >
                                        {rest.status === 'active' ? <Ban size={20} /> : <CheckCircle size={20} />}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Create Modal */}
            <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Yangi Restoran">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomi</label>
                        <input className="w-full border dark:border-gray-600 rounded-lg px-4 py-2 dark:bg-gray-700 dark:text-white" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input type="email" className="w-full border dark:border-gray-600 rounded-lg px-4 py-2 dark:bg-gray-700 dark:text-white" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon</label>
                        <input className="w-full border dark:border-gray-600 rounded-lg px-4 py-2 dark:bg-gray-700 dark:text-white" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan</label>
                        <select className="w-full border dark:border-gray-600 rounded-lg px-4 py-2 dark:bg-gray-700 dark:text-white" value={formData.plan} onChange={e => setFormData({ ...formData, plan: e.target.value })}>
                            <option value="basic">Basic</option>
                            <option value="standard">Standard</option>
                            <option value="premium">Premium</option>
                        </select>
                    </div>
                    <button disabled={submitting} type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4 disabled:opacity-50">
                        {submitting ? <Loader2 className="animate-spin mx-auto" /> : "Yaratish"}
                    </button>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Restoranni Tahrirlash">
                <form onSubmit={handleEdit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomi</label>
                        <input className="w-full border dark:border-gray-600 rounded-lg px-4 py-2 dark:bg-gray-700 dark:text-white" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (O'zgartirib bo'lmaydi)</label>
                        <input className="w-full border dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed" disabled value={formData.email} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon</label>
                        <input className="w-full border dark:border-gray-600 rounded-lg px-4 py-2 dark:bg-gray-700 dark:text-white" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan</label>
                        <select className="w-full border dark:border-gray-600 rounded-lg px-4 py-2 dark:bg-gray-700 dark:text-white" value={formData.plan} onChange={e => setFormData({ ...formData, plan: e.target.value })}>
                            <option value="basic">Basic</option>
                            <option value="standard">Standard</option>
                            <option value="premium">Premium</option>
                        </select>
                    </div>
                    <button disabled={submitting} type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4 disabled:opacity-50">
                        {submitting ? <Loader2 className="animate-spin mx-auto" /> : "Saqlash"}
                    </button>
                </form>
            </Modal>

            {/* Password Modal */}
            <Modal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} title="Parolni O'zgartirish">
                <form onSubmit={handlePasswordReset} className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        <b>{selectedRestaurant?.name}</b> admini uchun yangi parol kiriting.
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yangi Parol</label>
                        <input
                            type="password"
                            className="w-full border dark:border-gray-600 rounded-lg px-4 py-2 dark:bg-gray-700 dark:text-white"
                            required
                            minLength={6}
                            value={passwordData}
                            onChange={e => setPasswordData(e.target.value)}
                            placeholder="Kamida 6 belgi"
                        />
                    </div>
                    <button disabled={submitting} type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg mt-4 disabled:opacity-50">
                        {submitting ? <Loader2 className="animate-spin mx-auto" /> : "Parolni Yangilash"}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Restaurants;
