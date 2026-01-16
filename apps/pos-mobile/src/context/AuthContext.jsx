import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('pos_mobile_user')) || null);
    const [loading, setLoading] = useState(false);

    // API URL - Desktop serverdan tarqatilganda relative path (/api) ishlatamiz.
    // Developmentda vite.config.js da proxy bo'lishi kerak.
    const API_URL = '/api';

    const login = async (pin) => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/login`, { pin });
            if (res.data) {
                // Faqat waiter yoki admin kira oladi
                if (res.data.role !== 'waiter' && res.data.role !== 'admin') {
                    throw new Error("Ruxsat yo'q");
                }
                setUser(res.data);
                localStorage.setItem('pos_mobile_user', JSON.stringify(res.data));
                return true;
            }
        } catch (error) {
            console.error("Login Error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('pos_mobile_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
