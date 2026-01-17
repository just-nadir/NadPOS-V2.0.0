import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            // Token bor bo'lsa, user ma'lumotlarini tiklash yoki shunchaki loggedIn deb hisoblash
            // Hozircha decode qilmasdan, oddiy object qo'yamiz (MVP)
            setUser({ role: 'super_admin' });
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post('/admin/login', { email, password });
            const { token, user } = res.data;
            localStorage.setItem('adminToken', token);
            setUser(user);
            return { success: true };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
