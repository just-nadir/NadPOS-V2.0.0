import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PrivateRoute({ children, role }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background text-white">Yuklanmoqda...</div>;
    }

    // Tizimga kirmagan bo'lsa
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Rol tekshirish (Agar rol talab qilingan bo'lsa)
    // Rol tekshirish (Agar rol talab qilingan bo'lsa)
    if (role && user.role !== role) {
        console.warn(`Role mismatch: Expected ${role}, got ${user.role}`);
        // Noto'g'ri rol bilan kirsa, o'zining dashboardiga otvoramiz
        return <Navigate to={user.role === 'super_admin' ? '/admin' : '/dashboard'} replace />;
    }

    return children ? children : <Outlet />;
}
