import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LogOut, RefreshCcw, Search, Users, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useSocket } from '../context/SocketContext';

const Tables = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const socket = useSocket(); // Socket ni olish

    const [halls, setHalls] = useState([]);
    const [tables, setTables] = useState([]);
    const [activeHall, setActiveHall] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        // setLoading(true); // Don't block UI on socket update
        try {
            const [hallsRes, tablesRes] = await Promise.all([
                axios.get('/api/halls'),
                axios.get('/api/tables')
            ]);
            setHalls(hallsRes.data);

            // Faqat o'zgargan bo'lsa set qilish (React re-render ni kamaytirish uchun optional, lekin hozir shart emas)
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

        // Socket listeners
        if (socket) {
            // Serverdan 'tables' yoki 'db-change' eventini kutamiz
            // Serverda database.cjs da onChange -> io.emit('db-change', { type, id })

            const handleDbChange = (data) => {
                // Agar o'zgarish tables, halls yoki orders ga tegishli bo'lsa, yangilaymiz
                if (['tables', 'halls', 'orders', 'order_items'].includes(data.type)) {
                    console.log("🔔 Socket Update:", data.type);
                    fetchData();
                }
            };

            socket.on('db-change', handleDbChange);

            // Backup uchun (agar db-change kelmasa)
            socket.on('tables-update', fetchData);

            return () => {
                socket.off('db-change', handleDbChange);
                socket.off('tables-update', fetchData);
            };
        }
    }, [socket]);

    const filteredTables = tables.filter(t => t.hall_id === activeHall);

    const getTableColor = (status) => {
        switch (status) {
            case 'occupied': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400'; // Band
            case 'active': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400'; // Legacy support
            case 'payment': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-900/50 text-purple-700 dark:text-purple-400'; // To'lov jarayoni
            case 'reserved': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900/50 text-yellow-700 dark:text-yellow-400'; // Bron
            default: return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500'; // Bo'sh
        }
    };

    const formatPrice = (price) => {
        return price ? price.toLocaleString() + " so'm" : "";
    };

    const handleTableClick = (tableId) => {
        navigate(`/menu/${tableId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex flex-col">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 px-4 py-3 shadow-sm flex items-center justify-between sticky top-0 z-20 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold transition-colors">
                        {user?.name?.[0]}
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-800 dark:text-white leading-tight transition-colors">Zallar</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{user?.name}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={logout} className="p-2 text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-xl active:bg-red-100 dark:active:bg-red-900/40 transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Halls Tabs */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-2 overflow-x-auto flex gap-2 no-scrollbar sticky top-[64px] z-10 shadow-sm transition-colors">
                {halls.map(hall => (
                    <button
                        key={hall.id}
                        onClick={() => setActiveHall(hall.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeHall === hall.id
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/20'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        {hall.name}
                    </button>
                ))}
            </div>

            {/* Tables Grid */}
            <main className="flex-1 p-4 overflow-y-auto">
                {filteredTables.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-600 transition-colors">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 transition-colors">
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
                                <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${table.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                                    }`}>
                                    {halls.find(h => h.id === activeHall)?.name}
                                </span>
                                <span className={`text-2xl font-black mb-1 ${table.status === 'active' ? 'text-gray-800 dark:text-white' : 'text-gray-800 dark:text-white'
                                    }`}>
                                    {table.name}
                                </span>

                                {(table.status === 'occupied' || table.status === 'payment') && (
                                    <>
                                        <p className="text-xs font-bold opacity-80 mt-1 text-gray-700 dark:text-gray-300">
                                            {formatPrice(table.total_amount)}
                                        </p>
                                        <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${table.status === 'payment' ? 'bg-purple-500' : 'bg-red-500'} animate-pulse`}></div>
                                    </>
                                )}

                                {table.status === 'reserved' && (
                                    <span className="text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full mt-1">Rezerv</span>
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
