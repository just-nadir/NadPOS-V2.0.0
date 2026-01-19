import axios from './api';

const superAdminService = {
    // Get all restaurants
    getAllRestaurants: async () => {
        const response = await axios.get('/super-admin/restaurants');
        return response.data;
    },

    // Block or Unblock restaurant
    toggleStatus: async (id, status) => {
        const response = await axios.put(`/super-admin/restaurants/${id}/status`, { status });
        return response.data;
    }
};

export default superAdminService;
