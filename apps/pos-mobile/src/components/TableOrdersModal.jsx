import React, { useEffect, useState } from 'react';
import { X, Receipt, UtensilsCrossed } from 'lucide-react';
import axios from 'axios';

const TableOrdersModal = ({ isOpen, onClose, tableId, tableName }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (isOpen && tableId) {
            fetchOrders();
        }
    }, [isOpen, tableId]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/tables/${tableId}/items`);
            setItems(res.data);
            const sum = res.data.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            setTotal(sum);
        } catch (err) {
            console.error("Orders error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-3xl">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Receipt size={20} className="text-blue-600" />
                            Stol hisobi
                        </h2>
                        <p className="text-sm text-gray-500 font-medium">{tableName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                            <p className="text-gray-500 text-sm">Yuklanmoqda...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                            <UtensilsCrossed size={48} className="mb-2 opacity-50" />
                            <p>Buyurtmalar yo'q</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex justify-between items-start border-b border-dashed border-gray-100 pb-3 last:border-0 last:pb-0">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-800 text-sm mb-1">{item.product_name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span>{item.quantity} x {item.price?.toLocaleString()}</span>
                                            {item.unit_type === 'kg' && <span className="bg-gray-100 px-1 rounded">kg</span>}
                                        </div>
                                    </div>
                                    <p className="font-bold text-gray-900 text-sm whitespace-nowrap">
                                        {(item.price * item.quantity).toLocaleString()} so'm
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-500 font-medium">Jami:</span>
                        <span className="text-2xl font-black text-gray-900">{total.toLocaleString()} <span className="text-sm font-normal text-gray-500">so'm</span></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TableOrdersModal;
