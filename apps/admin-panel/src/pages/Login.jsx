import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Lock, Phone, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const { login, testLogin } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        phone: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(formData.phone, formData.password);

        if (result.success) {
            // Role based redirect is handled in PrivateRoute mostly, but here we can force it too
            // or just rely on state update. But let's check role from result or context if possible.
            // Getting user from context immediately might not work due to state update async.
            // But login function returns simulation success.
            // We can check localstorage or decode token, but simplest is:
            // The login function in AuthContext sets state. We can just navigate to root /admin or /dashboard
            // Let's rely on the user object in localStorage which is set in login()
            const user = JSON.parse(localStorage.getItem('user'));

            if (user?.role === 'super_admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } else {
            alert(result.message); // Simple alert for now, or use a toast
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[500px] bg-secondary/10 rounded-full blur-[100px] -z-10" />

            <div className="w-full max-w-md p-8 relative">
                <div className="absolute inset-0 bg-surface/30 backdrop-blur-xl rounded-2xl border border-white/10 -z-10 shadow-2xl" />

                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 mx-auto mb-4">
                        <span className="text-2xl font-bold text-white">N</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Xush kelibsiz</h1>
                    <p className="text-gray-400 text-sm">Biznesingizni boshqarish uchun tizimga kiring</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Telefon raqam</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                            <Input
                                type="tel"
                                placeholder="+998 90 123 45 67"
                                className="pl-10"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-300">Parol</label>
                            <a href="#" className="text-xs text-primary hover:text-primary-light">Parolni unutdingizmi?</a>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="pl-10"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <Button className="w-full" size="lg" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Tekshirilmoqda...
                            </>
                        ) : (
                            <>
                                Tizimga Kirish
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        Hali hisobingiz yo'qmi? <a href="#" className="text-primary hover:underline">Ro'yxatdan o'tish</a>
                    </p>
                </div>
            </div>
            <div className="absolute bottom-4 text-center w-full">
                <p className="text-xs text-gray-600">© 2026 NadPOS. Secure Admin Panel.</p>
            </div>
        </div>
    );
}
