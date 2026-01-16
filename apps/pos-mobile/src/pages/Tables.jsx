import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LogOut, RefreshCcw, Search, Users, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Tables = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [halls, setHalls] = useState([]);
    const [tables, setTables] = useState([]);
    const [activeHall, setActiveHall] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [hallsRes, tablesRes] = await Promise.all([
                axios.get('/api/halls'),
                axios.get('/api/tables')
            ]);
            setHalls(hallsRes.data);
            setTables(tablesRes.data);
            setTables(tablesRes.data);

            // Active Hall ni saqlash yoki default qilish (Functional Update)
            setActiveHall(prev => {
                // Agar avval tanlangan zal mavjud bo'lsa, uni saqlaymiz
                if (prev && hallsRes.data.find(h => h.id === prev)) {
                    return prev;
                }
                // Aks holda (yoki tanlangan zal o'chirilgan bo'lsa) birinchisini tanlaymiz
                return hallsRes.data.length > 0 ? hallsRes.data[0].id : null;
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Har 3 sekundda yangilab turish (tezkorroq)
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const filteredTables = tables.filter(t => t.hall_id === activeHall);

    const getTableColor = (status) => {
        switch (status) {
            case 'occupied': return 'bg-red-50 border-red-200 text-red-700'; // Band
            case 'active': return 'bg-red-50 border-red-200 text-red-700'; // Legacy support
            case 'payment': return 'bg-purple-50 border-purple-200 text-purple-700'; // To'lov jarayoni
            case 'reserved': return 'bg-yellow-50 border-yellow-200 text-yellow-700'; // Bron
            default: return 'bg-white border-gray-200 text-gray-700 hover:border-blue-400'; // Bo'sh
        }
    };

    const formatPrice = (price) => {
        return price ? price.toLocaleString() + " so'm" : "";
    };

    const handleTableClick = (tableId) => {
        navigate(`/menu/${tableId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white px-4 py-3 shadow-sm flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {user?.name?.[0]}
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-800 leading-tight">Zallar</h1>
                        <p className="text-xs text-gray-500 font-medium">{user?.name}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={logout} className="p-2 text-red-500 bg-red-50 rounded-xl active:bg-red-100">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Halls Tabs */}
            <div className="bg-white border-b border-gray-100 px-4 py-2 overflow-x-auto flex gap-2 no-scrollbar sticky top-[64px] z-10 shadow-sm">
                {halls.map(hall => (
                    <button
                        key={hall.id}
                        onClick={() => setActiveHall(hall.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeHall === hall.id
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                    >
                        {hall.name}
                    </button>
                ))}
            </div>

            {/* Tables Grid */}
            <main className="flex-1 p-4 overflow-y-auto">
                {filteredTables.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Utensils size={32} />
                        </div>
                        <p>Bu zalda stollar yo'q</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {filteredTables.map(table => (
                            <button
                                key={table.id}
                                onClick={() => handleTableClick(table.id)}
                                className={`p-4 rounded-2xl border flex flex-col items-center justify-center h-32 transition-all active:scale-95 relative overflow-hidden shadow-sm ${getTableColor(table.status)}`}
                            >
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                    {halls.find(h => h.id === activeHall)?.name}
                                </span>
                                <span className="text-2xl font-black mb-1 text-gray-800">{table.name}</span>

                                {(table.status === 'occupied' || table.status === 'payment') && (
                                    <>
                                        <p className="text-xs font-bold opacity-80 mt-1">
                                            {formatPrice(table.total_amount)}
                                        </p>
                                        <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${table.status === 'payment' ? 'bg-purple-500' : 'bg-red-500'} animate-pulse`}></div>
                                    </>
                                )}

                                {table.status === 'reserved' && (
                                    <span className="text-xs font-medium bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full mt-1">Rezerv</span>
                                )}

                            </button>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Tables;
