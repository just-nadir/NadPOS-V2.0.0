import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

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
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// MOCK ADAPTER (Development only) - DISABLED FOR REAL BACKEND
/*
if (!import.meta.env.PROD) {
    const mock = new MockAdapter(api, { delayResponse: 800 });

    // 1. Dashboard Stats
    mock.onGet('/super-admin/stats').reply(200, {
        total_restaurants: 24,
        active_today: 18,
        mrr: 12500000,
        new_this_month: 4,
        revenue_chart: [
            { name: 'Jan', value: 8000000 },
            { name: 'Feb', value: 9500000 },
            { name: 'Mar', value: 11000000 },
            { name: 'Apr', value: 10500000 },
            { name: 'May', value: 12500000 },
            { name: 'Jun', value: 14000000 },
        ],
        growth_chart: [
            { name: 'Jan', active: 10 },
            { name: 'Feb', active: 12 },
            { name: 'Mar', active: 15 },
            { name: 'Apr', active: 18 },
            { name: 'May', active: 22 },
            { name: 'Jun', active: 24 },
        ],
        recent_activity: [
            { id: 1, type: 'new_restaurant', message: '"Osh Markazi" qo\'shildi', time: '2 soat oldin' },
            { id: 2, type: 'license_renew', message: '"Rayhon" litsenziyasi uzaytirildi', time: '5 soat oldin' },
            { id: 3, type: 'block', message: '"Lazzat" bloklandi (To\'lov)', time: '1 kun oldin' },
        ]
    });

    // 2. Restaurants List
    mock.onGet('/super-admin/restaurants').reply(200, [
        { id: '1', name: 'Rayhon Milliy Taomlar', owner: 'Alisher V.', phone: '+998901234567', status: 'active', plan: 'Premium', expires_at: '2026-05-20' },
        { id: '2', name: 'Osh Markazi', owner: 'Jamshid K.', phone: '+998998765432', status: 'trial', plan: 'Start', expires_at: '2026-02-10' },
        { id: '3', name: 'Coffee House', owner: 'Malika A.', phone: '+998933332211', status: 'active', plan: 'Standard', expires_at: '2026-04-15' },
        { id: '4', name: 'Lazzat Fast Food', owner: 'Sardor T.', phone: '+998977778899', status: 'blocked', plan: 'Standard', expires_at: '2025-12-30' },
        { id: '5', name: 'Besh Qozon', owner: 'Nodir B.', phone: '+998900001122', status: 'active', plan: 'Premium', expires_at: '2026-06-01' },
    ]);

    // 3. Users List
    mock.onGet('/super-admin/users').reply(200, [
        { id: '1', name: 'Alisher V.', phone: '+998901234567', role: 'admin', restaurant: 'Rayhon Milliy Taomlar', status: 'active' },
        { id: '2', name: 'Jamshid K.', phone: '+998998765432', role: 'admin', restaurant: 'Osh Markazi', status: 'active' },
        { id: '3', name: 'Sardor T.', phone: '+998977778899', role: 'admin', restaurant: 'Lazzat Fast Food', status: 'blocked' },
        { id: '4', name: 'Malika A.', phone: '+998933332211', role: 'manager', restaurant: 'Coffee House', status: 'active' },
        { id: '5', name: 'Nodir B.', phone: '+998900001122', role: 'admin', restaurant: 'Besh Qozon', status: 'active' },
        { id: '6', name: 'Jasur M.', phone: '+998901112233', role: 'waiter', restaurant: 'Rayhon Milliy Taomlar', status: 'active' },
    ]);

    // Auth Login (Pass through or mock if backend fails)
    mock.onPost('/auth/login').passThrough();
}
*/

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '#/login';
        }
        return Promise.reject(error);
    }
);

export default api;
