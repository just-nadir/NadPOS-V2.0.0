import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Proxied via Nginx
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
