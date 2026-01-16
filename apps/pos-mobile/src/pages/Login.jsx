import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Store, ChefHat, Delete } from 'lucide-react';

const Login = () => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleNumClick = (num) => {
        if (pin.length < 4) {
            setPin(prev => prev + num);
            setError('');
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    const handleLogin = async () => {
        if (pin.length === 0) return;
        try {
            await login(pin);
            navigate('/');
        } catch (err) {
            setError("PIN noto'g'ri");
            setPin('');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 flex flex-col items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl w-full max-w-sm shadow-2xl border border-white/20">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <ChefHat size={40} className="text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1">NadPOS Waiter</h1>
                    <p className="text-blue-200 text-sm">Ofitsiant tizimi</p>
                </div>

                <div className="mb-8">
                    <div className="bg-white/20 rounded-2xl h-16 flex items-center justify-center text-3xl font-bold text-white tracking-[1em] mb-2 shadow-inner">
                        {pin.split('').map(() => '•').join('')}
                        {pin.length === 0 && <span className="opacity-30 tracking-normal text-lg">PIN kiriting</span>}
                    </div>
                    {error && <p className="text-red-300 text-center text-sm font-medium animate-pulse">{error}</p>}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumClick(num)}
                            className="h-16 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-2xl font-semibold transition-all active:scale-95 shadow-lg border border-white/5"
                        >
                            {num}
                        </button>
                    ))}
                    <div className="col-span-1"></div>
                    <button
                        onClick={() => handleNumClick(0)}
                        className="h-16 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-2xl font-semibold transition-all active:scale-95 shadow-lg border border-white/5"
                    >
                        0
                    </button>
                    <button
                        onClick={handleDelete}
                        className="h-16 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-200 flex items-center justify-center transition-all active:scale-95 shadow-lg border border-white/5"
                    >
                        <Delete size={24} />
                    </button>
                </div>

                <button
                    onClick={handleLogin}
                    disabled={loading || pin.length < 4}
                    className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                        <>
                            <Lock size={20} />
                            Tizimga Kirish
                        </>
                    )}
                </button>
            </div>

            <p className="mt-8 text-white/40 text-xs">NadPOS v2.0 Mobile</p>
        </div>
    );
};

export default Login;
