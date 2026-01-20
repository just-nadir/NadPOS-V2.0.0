import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:4000/api', // Local Backend URL
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;
