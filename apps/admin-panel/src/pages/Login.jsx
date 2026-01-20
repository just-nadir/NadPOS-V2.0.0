import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await login(email, password);

        if (res.success) {
            navigate('/');
        } else {
            setError(res.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Logo/Brand */}
                <div className="flex justify-center mb-8">
                    <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
                        <Shield className="text-white w-10 h-10" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <div className="p-8 pb-6">
                        <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-2">Xush Kelibsiz</h2>
                        <p className="text-center text-slate-500 dark:text-slate-400 text-sm">NadPOS Admin tizimiga kirish</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-5">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium border border-red-100 dark:border-red-800 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wide text-slate-500 ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                    placeholder="admin@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wide text-slate-500 ml-1">Parol</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100 mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Kirish <ArrowRight size={20} /></>}
                        </button>
                    </form>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 text-center border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-400 font-mono">v1.0.0 • Secure Admin Portal</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
