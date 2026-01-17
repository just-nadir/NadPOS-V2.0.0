import axios from 'axios';
import toast from 'react-hot-toast';

// VPS URL
const API_URL = 'https://nadpos.uz/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor to add token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor for 401 (Logout) and Global Errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.error || 'Server xatosi yuz berdi';

        if (error.response && error.response.status === 401) {
            localStorage.removeItem('adminToken');
            window.location.href = '/login';
            toast.error('Sessiya tugadi. Qayta kiring.');
        } else {
            // Show toast for other errors (unless suppressed)
            if (!error.config?.suppressToast) {
                toast.error(message);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
