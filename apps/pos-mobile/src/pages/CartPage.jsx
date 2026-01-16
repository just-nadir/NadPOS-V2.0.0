import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Trash2, Send, Plus, Minus } from 'lucide-react';
import axios from 'axios';

const CartPage = () => {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [tableName, setTableName] = useState('');

    const cartItems = cart.filter(item => item.tableId === tableId);
    const totalAmount = getCartTotal(tableId);

    useEffect(() => {
        const fetchTableInfo = async () => {
            try {
                const res = await axios.get('/api/tables');
                const currentTable = res.data.find(t => t.id === tableId);
                if (currentTable) {
                    setTableName(`${currentTable.hall_name || 'Zal'} - ${currentTable.name}`);
                } else {
                    setTableName('Noma\'lum Stol');
                }
            } catch (err) {
                console.error("Error fetching tables:", err);
                setTableName('Stol topilmadi');
            }
        };

        if (tableId) {
            fetchTableInfo();
        }
    }, [tableId]);

    const handleSendOrder = async () => {
        if (cartItems.length === 0) return;
        setLoading(true);

        try {
            // API ga yuborish uchun ma'lumotlarni tayyorlash
            // Serverdagi /api/orders/bulk-add endpointi kutilmoqda
            const payload = {
                tableId: parseInt(tableId) || tableId, // Agar tableId string bo'lmasa number kerak bo'lishi mumkin
                waiterId: user.id,
                items: cartItems.map(item => ({
                    id: item.id, // product_id
                    productId: item.id, // Ba'zi joylarda productId deb kutiladi
                    name: item.name, // Backend name orqali destination oladi
                    qty: item.quantity, // Backend qty deb kutadi
                    price: item.price,
                    destination: item.destination // Agar bo'lsa
                }))
            };

            await axios.post('/api/orders/bulk-add', payload);

            clearCart(tableId); // Savatchani tozalash
            navigate('/'); // Zallarga qaytish
        } catch (err) {
            console.error("Order error:", err);
            alert("Buyurtma yuborishda xatolik bo'ldi!");
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <Trash2 size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Savatcha bo'sh</h2>
                <p className="text-gray-500 mb-6">Siz hali hech narsa tanlamadingiz</p>
                <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">
                    Menyuga qaytish
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white px-4 py-3 shadow-sm flex items-center gap-3 sticky top-0 z-20">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="font-bold text-gray-800 leading-tight">Savatcha</h1>
                    <p className="text-xs text-gray-500 font-medium">{tableName || 'Yuklanmoqda...'}</p>
                </div>
                <button onClick={() => clearCart(tableId)} className="ml-auto text-red-500 text-sm font-bold bg-red-50 px-3 py-1.5 rounded-lg active:bg-red-100">
                    Tozalash
                </button>
            </header>

            {/* Items List */}
            <main className="flex-1 p-4 pb-32 overflow-y-auto">
                <div className="space-y-4">
                    {cartItems.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            {/* Rasm ko'rsatmaslik haqida gapirilmagan, lekin menyuda olib tashlagandik. Bu yerda ham olib tashlaymiz ixchamlik uchun. */}
                            {/* <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${item.image || ''})` }}></div> */}

                            <div className="flex-1">
                                <h3 className="font-bold text-gray-800 text-sm mb-1">{item.name}</h3>
                                {item.unit_type === 'kg' && <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded mr-2">kg</span>}
                                <p className="text-orange-500 font-bold text-xs">{(item.price * item.quantity).toLocaleString()} so'm</p>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                                <button onClick={() => updateQuantity(item.id, tableId, -1)} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-600 active:scale-95">
                                    {item.quantity <= 1 && item.unit_type !== 'kg' ? <Trash2 size={16} className="text-red-500" /> : <Minus size={16} />}
                                </button>
                                <span className="font-bold text-gray-800 w-12 text-center text-sm">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, tableId, 1)} className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-lg active:scale-95">
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer Summary */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500 font-medium">Jami summa:</span>
                    <span className="text-2xl font-black text-gray-900">{totalAmount.toLocaleString()} so'm</span>
                </div>
                <button
                    onClick={handleSendOrder}
                    disabled={loading}
                    className="w-full bg-green-600 text-white h-14 rounded-xl font-bold shadow-lg shadow-green-500/30 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70 disabled:active:scale-100 transition-all text-lg"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                        <>
                            <Send size={24} /> Buyurtma Berish
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default CartPage;
