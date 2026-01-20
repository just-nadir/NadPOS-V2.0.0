import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:4000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Use standard Bearer scheme
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Auto logout if 401
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '#/login';
        }
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;
