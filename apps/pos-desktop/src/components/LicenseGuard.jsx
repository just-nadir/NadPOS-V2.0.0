import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Lock, WifiOff, Server } from 'lucide-react';

// Cloud Backend URL (Development)
// Production da buni .env fayldan olish kerak
const API_URL = 'http://213.142.148.35:4000/api';

const LicenseGuard = ({ children }) => {
    const [status, setStatus] = useState('CHECKING'); // CHECKING | ACTIVE | LOCKED | OFFLINE_LOCKED
    const [licenseInfo, setLicenseInfo] = useState(null);
    const [hwid, setHwid] = useState('');

    // Login Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        checkLicense();
    }, []);

    const checkLicense = async () => {
        try {
            // 1. HWID ni olish
            const currentHwid = await window.electron.ipcRenderer.invoke('license:get-hwid');
            setHwid(currentHwid);

            // 2. Litsenziyani tekshirish (Lokal)
            const license = await window.electron.ipcRenderer.invoke('license:get-info');

            if (license.status === 'ACTIVE' || license.status === 'GRACE_PERIOD') {
                setStatus('ACTIVE');
                setLicenseInfo(license);
            } else {
                setStatus('LOCKED');
                if (license.reason) setError(license.reason);
            }
        } catch (err) {
            console.error("License Check Error:", err);
            setStatus('LOCKED');
            setError("Tizim xatosi: Litsenziyani tekshirib bo'lmadi");
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Cloud ga login qilish
            const res = await axios.post(`${API_URL}/auth/login`, {
                email,
                password,
                hwid
            });

            const { token } = res.data;

            // 2. Tokenni lokal saqlash
            const saveRes = await window.electron.ipcRenderer.invoke('license:save-token', token);

            if (saveRes.success) {
                // 3. Qayta tekshirish
                await checkLicense();
            } else {
                setError("Litsenziyani saqlashda xatolik: " + saveRes.error);
            }

        } catch (err) {
            if (err.response) {
                setError(err.response.data.error || "Login xatosi");
            } else if (err.request) {
                setError("Serverga ulanib bo'lmadi. Internetni tekshiring.");
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    if (status === 'CHECKING') {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600 mb-4" />
                    <p className="text-gray-500">Litsenziya tekshirilmoqda...</p>
                </div>
            </div>
        );
    }

    if (status === 'ACTIVE') {
        return children;
    }

    // LOCKED SCREEN (Login Form)
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">
            <div className="w-full max-w-md p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
                <div className="text-center mb-8">
                    <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">NadPOS Cloud Login</h1>
                    <p className="text-slate-400 text-sm">
                        Ushbu kompyuterni aktivlashtirish uchun Cloud hisobingizga kiring.
                    </p>
                    <p className="text-xs text-slate-500 mt-2 font-mono bg-slate-900 p-2 rounded">
                        HWID: {hwid}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder="admin@restoran.uz"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Parol</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Kirish va Aktivlashtirish"}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-700 text-center text-xs text-slate-500">
                    <div className="flex justify-center gap-4">
                        <span className="flex items-center gap-1"><WifiOff size={14} /> Offline-Ready</span>
                        <span className="flex items-center gap-1"><Server size={14} /> Cloud Sync</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LicenseGuard;
