import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check expiration
                if (decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem('adminToken');
                    setUser(null);
                } else {
                    setUser(decoded);
                }
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem('adminToken');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post('/admin/login', { email, password });
            const { token, user } = res.data;
            localStorage.setItem('adminToken', token);

            // Prefer tracking user from token for consistency
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);
            } catch {
                setUser(user);
            }

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
