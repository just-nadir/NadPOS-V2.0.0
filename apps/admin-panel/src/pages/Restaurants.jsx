import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Skeleton from '../components/common/Skeleton';
import RestaurantsTable from '../components/restaurants/RestaurantsTable';
import CreateRestaurantModal from '../components/restaurants/CreateRestaurantModal';
import ExtendLicenseModal from '../components/restaurants/ExtendLicenseModal';
import { Plus } from 'lucide-react';

const Restaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Extend License State
    const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const res = await api.get('/super-admin/restaurants');
            setRestaurants(res.data);
        } catch (error) {
            console.error("Fetch Restaurants Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExtend = (restaurant) => {
        setSelectedRestaurant(restaurant);
        setIsExtendModalOpen(true);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
                <Skeleton className="h-[500px] w-full rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Restoranlar Boshqaruvi</h1>
                    <p className="text-gray-500 text-sm">Jami {restaurants.length} ta restoran ro'yxatdan o'tgan.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition font-medium text-sm"
                >
                    <Plus size={18} />
                    <span>Yangi Restoran</span>
                </button>
            </div>

            {/* Table */}
            <RestaurantsTable
                restaurants={restaurants}
                onStatusChange={fetchRestaurants}
                onExtend={handleExtend}
            />

            {/* Create Modal */}
            <CreateRestaurantModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchRestaurants}
            />

            {/* Extend License Modal */}
            <ExtendLicenseModal
                isOpen={isExtendModalOpen}
                onClose={() => setIsExtendModalOpen(false)}
                restaurant={selectedRestaurant}
                onSuccess={fetchRestaurants}
            />
        </div>
    );
};

export default Restaurants;
