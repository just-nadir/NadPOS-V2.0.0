import React from 'react';
import { Package, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const mockActivities = [
    { id: 1, restaurant: 'Rayhon Milliy Taomlar', action: 'Litsenziya sotib oldi', status: 'success', time: '2 daqiqa oldin', amount: '+1,200,000 UZS' },
    { id: 2, restaurant: 'Sultan Saroy', action: 'To\'lov muddati tugadi', status: 'warning', time: '15 daqiqa oldin', amount: '-' },
    { id: 3, restaurant: 'Burger King', action: 'Yangi filial qo\'shildi', status: 'info', time: '1 soat oldin', amount: '+0' },
    { id: 4, restaurant: 'Oqtepa Lavash', action: 'Tizimga kirdi', status: 'neutral', time: '3 soat oldin', amount: '-' },
    { id: 5, restaurant: 'Evos', action: 'Xatolik yuz berdi', status: 'error', time: '5 soat oldin', amount: '-' },
];

const RecentActivity = ({ activities = [] }) => {
    const getStatusIcon = (status) => {
        switch (status) {
            case 'success': return <CheckCircle className="text-green-500" size={18} />;
            case 'warning': return <AlertCircle className="text-amber-500" size={18} />;
            case 'error': return <AlertCircle className="text-red-500" size={18} />;
            default: return <Clock className="text-blue-500" size={18} />;
        }
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Hozirgina';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} daqiqa oldin`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} soat oldin`;
        const days = Math.floor(hours / 24);
        return `${days} kun oldin`;
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">So'nggi Faoliyat</h3>
            <div className="space-y-6">
                {activities.length > 0 ? activities.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 group cursor-pointer">
                        <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-full group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition">
                            {getStatusIcon(item.status)}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition">{item.title}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                                </div>
                                {item.amount > 0 && (
                                    <span className="text-xs font-medium px-2 py-1 rounded-md bg-green-50 text-green-600 dark:bg-green-900/20">
                                        +{item.amount.toLocaleString()} UZS
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">{formatTimeAgo(item.time)}</p>
                        </div>
                    </div>
                )) : (
                    <div className="text-center text-gray-400 py-4 text-sm">Hozircha faoliyat yo'q</div>
                )}
            </div>
            <button className="w-full mt-6 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium border-t border-gray-100 dark:border-gray-700 pt-4 transition">
                Barchasini ko'rish
            </button>
        </div>
    );
};

export default RecentActivity;
