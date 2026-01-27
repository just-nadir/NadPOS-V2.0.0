import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage on load
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            setUser(JSON.parse(userData));
            // Set default header
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);

    const login = async (phone, password) => {
        try {
            const res = await api.post('/auth/login', { phone, password, hwid: 'WEB_ADMIN_PANEL' });

            const { token, user } = res.data;

            if (user.role !== 'super_admin' && user.role !== 'admin') {
                throw new Error('Ruxsat etilmagan foydalanuvchi');
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            return { success: true };
        } catch (error) {
            console.error("Login Failed:", error);
            return {
                success: false,
                message: error.response?.data?.error || error.message || 'Login xatoligi'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    // TEST UCHUN FAKE LOGIN
    const testLogin = (role) => {
        const fakeUser = {
            id: '123',
            phone: role === 'super_admin' ? '+998901234567' : '+998991112233',
            role: role,
            name: role === 'super_admin' ? 'Super Admin' : 'Restoran Egasi'
        };
        setUser(fakeUser);
        localStorage.setItem('user', JSON.stringify(fakeUser));
        // Fake token
        localStorage.setItem('token', 'fake-jwt-token');
    };

    const value = {
        user,
        loading,
        login,
        logout,
        testLogin,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
