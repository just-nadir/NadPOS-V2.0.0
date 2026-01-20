import React, { useState, useEffect } from 'react';
import { X, Key, Save, Loader2, Copy, Check } from 'lucide-react';
import api from '../../services/api';

const LicenseGeneratorModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [restaurants, setRestaurants] = useState([]);
    const [data, setData] = useState({ restaurantId: '', hwid: '', days: '30' });
    const [generatedToken, setGeneratedToken] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setGeneratedToken(null);
            setCopied(false);
            fetchRestaurants();
        }
    }, [isOpen]);

    const fetchRestaurants = async () => {
        try {
            const res = await api.get('/super-admin/restaurants');
            setRestaurants(res.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/super-admin/generate-license', data);
            setGeneratedToken(res.data.token);
        } catch (error) {
            alert(error.response?.data?.error || 'Xatolik');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedToken);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
                <button onClick={onClose} className="absolute right-4 top-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 transition">
                    <X size={20} className="text-gray-500" />
                </button>

                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <Key className="text-blue-500" /> Litsenziya Generatsiya Qilish
                </h2>

                {!generatedToken ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Restoran</label>
                            <select
                                required
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                value={data.restaurantId}
                                onChange={e => setData({ ...data, restaurantId: e.target.value })}
                            >
                                <option value="">Tanlang...</option>
                                {restaurants.map(r => (
                                    <option key={r.id} value={r.id}>{r.name} ({r.owner})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HWID (Kompyuter ID)</label>
                            <input
                                required
                                type="text"
                                placeholder="Kompyuterning Hardware ID raqami"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                value={data.hwid}
                                onChange={e => setData({ ...data, hwid: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Muddat (Kun)</label>
                            <input
                                required
                                type="number"
                                min="1"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                value={data.days}
                                onChange={e => setData({ ...data, days: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Generatsiya Qilish'}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800 text-center">
                            <p className="text-green-700 dark:text-green-400 font-bold text-lg mb-2">Litsenziya Tayyor!</p>
                            <p className="text-sm text-green-600/80">Ushbu kalitni nusxalab oling va mijozga yuboring.</p>
                        </div>

                        <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl break-all font-mono text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            {generatedToken}
                        </div>

                        <button
                            onClick={copyToClipboard}
                            className={cn(
                                "w-full py-3 font-bold rounded-xl transition flex items-center justify-center gap-2",
                                copied ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
                            )}
                        >
                            {copied ? <><Check size={20} /> Nusxalandi</> : <><Copy size={20} /> Nusxalash</>}
                        </button>

                        <button
                            onClick={() => setGeneratedToken(null)}
                            className="w-full py-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                        >
                            Yangi yaratish
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Utils import needed for cn if used, otherwise remove it or assume global utils
import { cn } from '../../lib/utils';
export default LicenseGeneratorModal;
