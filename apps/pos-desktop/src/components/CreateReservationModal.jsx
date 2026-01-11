import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Phone, Users, Clock, AlignLeft, Minus, Plus, Armchair, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { useGlobal } from '../context/GlobalContext';

const CreateReservationModal = ({ onClose, onSave }) => {
    const { user } = useGlobal();
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        reservation_time: '',
        guests: 2,
        table_id: '',
        note: ''
    });
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadTables = async () => {
            if (window.electron) {
                try {
                    const result = await window.electron.ipcRenderer.invoke('get-tables');
                    setTables(result || []);
                } catch (e) {
                    console.error("Failed to load tables", e);
                }
            } else {
                setTables([{ id: '1', name: 'Stol 1 (4 kishi)' }, { id: '2', name: 'VIP 1 (6 kishi)' }]);
            }
        };
        loadTables();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGuestChange = (delta) => {
        setFormData(prev => ({ ...prev, guests: Math.max(1, prev.guests + delta) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!formData.customer_name || !formData.reservation_time) {
                alert("Ism va vaqtni kiriting!");
                setLoading(false);
                return;
            }

            const newReservation = {
                ...formData,
                id: crypto.randomUUID(),
                status: 'active',
                created_at: new Date().toISOString()
            };

            await onSave(newReservation);
            onClose();
        } catch (error) {
            console.error("Error creating reservation:", error);
            alert("Xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    // Helper for input styles
    const inputClass = "w-full p-3 pl-10 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-medium";
    const labelClass = "text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 border border-white/10">

                {/* Header */}
                <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/80 dark:bg-zinc-900/80 backdrop-blur">
                    <div>
                        <h3 className="font-extrabold text-xl text-foreground flex items-center gap-2">
                            Yangi Bron
                        </h3>
                        <p className="text-xs text-muted-foreground">Mijoz ma'lumotlarini kiriting</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">

                    {/* Basic Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className={labelClass}>
                                <User size={12} className="text-indigo-500" /> Mijoz Ismi <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    name="customer_name"
                                    value={formData.customer_name}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Ism Familiya"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className={labelClass}>
                                <Phone size={12} className="text-green-500" /> Telefon <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    name="customer_phone"
                                    value={formData.customer_phone}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="+998 90 123 45 67"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Time & Guests Section */}
                    <div className="p-4 bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div className="space-y-1">
                            <label className={labelClass}>
                                <Clock size={12} className="text-orange-500" /> Vaqt <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                {/* <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" /> */}
                                <input
                                    type="datetime-local"
                                    name="reservation_time"
                                    value={formData.reservation_time}
                                    onChange={handleChange}
                                    className={inputClass.replace('pl-10', 'pl-3')} // Remove left padding for date input
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className={labelClass}>
                                <Users size={12} className="text-blue-500" /> Mehmonlar
                            </label>
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={() => handleGuestChange(-1)} className="w-10 h-10 rounded-xl border border-gray-200 dark:border-zinc-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                    <Minus size={16} />
                                </button>
                                <div className="flex-1 text-center font-bold text-lg">
                                    {formData.guests}
                                </div>
                                <button type="button" onClick={() => handleGuestChange(1)} className="w-10 h-10 rounded-xl border border-gray-200 dark:border-zinc-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table Selection */}
                    <div className="space-y-1">
                        <label className={labelClass}>
                            <Armchair size={12} className="text-purple-500" /> Stol Tanlash
                        </label>
                        <div className="relative">
                            <Armchair size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <select
                                name="table_id"
                                value={formData.table_id}
                                onChange={handleChange}
                                className={`${inputClass} appearance-none cursor-pointer`}
                            >
                                <option value="">Stol tanlanmagan (Avtomatik)</option>
                                {tables.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className={labelClass}>
                            <AlignLeft size={12} /> Izoh
                        </label>
                        <textarea
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            rows="2"
                            className={`${inputClass} !pl-3 resize-none h-20`}
                            placeholder="Mijozning maxsus talablari..."
                        />
                    </div>
                </form>

                <div className="p-5 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-zinc-900/50">
                    <Button variant="outline" onClick={onClose} type="button" className="rounded-xl px-6 h-11 border-gray-200">Bekor qilish</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="rounded-xl px-8 h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20"
                    >
                        {loading ? 'Saqlanmoqda...' : 'Tasdiqlash'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateReservationModal;
