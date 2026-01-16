import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { ArrowLeft, ShoppingCart, Search, Plus, Minus, Receipt } from 'lucide-react';
import NumpadModal from '../components/NumpadModal';
import TableOrdersModal from '../components/TableOrdersModal';

const Menu = () => {
    const { tableId } = useParams();
    const navigate = useNavigate();
    const { addToCart, cart, updateQuantity, getCartTotal } = useCart();

    // Desktop API serveridan ma'lumotlar
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [tableName, setTableName] = useState('');

    // Numpad state
    const [isNumpadOpen, setIsNumpadOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Orders Modal state
    const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);

    const cartItems = cart.filter(item => item.tableId === tableId);
    const totalAmount = getCartTotal(tableId);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Products va Tables fetching
                const [productsRes, tablesRes] = await Promise.all([
                    axios.get('/api/products'),
                    axios.get('/api/tables')
                ]);

                // Products
                const productsData = productsRes.data;
                setProducts(productsData);

                // Categories
                const uniqueCategories = [...new Set(productsData.map(p => p.category_name).filter(Boolean))];
                setCategories(uniqueCategories);
                if (uniqueCategories.length > 0) setActiveCategory(uniqueCategories[0]);

                // Current Table Name finding
                const currentTable = tablesRes.data.find(t => t.id === tableId);
                if (currentTable) {
                    setTableName(`${currentTable.hall_name || 'Zal'} - ${currentTable.name}`);
                } else {
                    setTableName('Noma\'lum Stol');
                }

            } catch (err) {
                console.error(err);
                setTableName('Xatolik');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [tableId]);

    // Filter products
    const filteredProducts = activeCategory === 'all'
        ? products
        : products.filter(p => p.category_name === activeCategory);

    const getItemQuantity = (productId) => {
        const item = cartItems.find(i => i.id === productId);
        return item ? item.quantity : 0;
    };

    const handleProductClick = (product) => {
        // Agar mahsulot kg da bo'lsa yoki shunga o'xshash
        if (product.unit_type === 'kg' || product.unit_type === 'litr') {
            setSelectedProduct(product);
            setIsNumpadOpen(true);
        } else {
            addToCart(product, tableId, 1);
        }
    };

    const handleNumpadConfirm = (value) => {
        if (selectedProduct && value > 0) {
            addToCart(selectedProduct, tableId, value);
        }
        setIsNumpadOpen(false);
        setSelectedProduct(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white px-4 py-3 shadow-sm flex items-center gap-3 sticky top-0 z-20">
                <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="font-bold text-gray-800 leading-tight">Menyu</h1>
                    <p className="text-xs text-gray-500 font-medium">{tableName || 'Yuklanmoqda...'}</p>
                </div>

                <button
                    onClick={() => setIsOrdersModalOpen(true)}
                    className="ml-auto p-2 bg-gray-100 text-blue-600 rounded-xl active:bg-blue-50"
                >
                    <Receipt size={24} />
                </button>
            </header>

            {/* Categories */}
            <div className="bg-white border-b border-gray-100 px-4 py-2 overflow-x-auto flex gap-2 no-scrollbar sticky top-[60px] z-10 shadow-sm">
                {categories.map((cat, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all capitalize ${activeCategory === cat
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                            : 'bg-gray-100 text-gray-600'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Products Grid */}
            <main className="flex-1 p-4 pb-24 overflow-y-auto">
                <div className="grid grid-cols-1 gap-4">
                    {filteredProducts.map(product => {
                        const quantity = getItemQuantity(product.id);
                        return (
                            <div
                                key={product.id}
                                onClick={() => handleProductClick(product)}
                                className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4 cursor-pointer active:scale-95 transition-transform"
                            >
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{product.name}</h3>
                                        <p className="text-orange-500 font-bold mt-1">{product.price?.toLocaleString()} so'm</p>
                                        {product.unit_type === 'kg' && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">kg</span>}
                                    </div>

                                    {quantity === 0 ? (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleProductClick(product); }}
                                            className="self-end bg-gray-100 text-blue-600 px-4 py-2 rounded-xl font-bold text-sm active:bg-blue-100 flex items-center gap-1"
                                        >
                                            <Plus size={16} /> Qo'shish
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-3 self-end bg-blue-50 rounded-xl p-1" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => updateQuantity(product.id, tableId, -1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-blue-600 active:scale-95"><Minus size={16} /></button>
                                            <span className="font-bold text-blue-700 w-4 text-center">{quantity} {product.unit_type === 'kg' ? '' : ''}</span>
                                            <button onClick={() => handleProductClick(product)} className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-lg shadow-sm active:scale-95"><Plus size={16} /></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Float Cart Button */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-6 left-4 right-4 z-30">
                    <button
                        onClick={() => navigate(`/cart/${tableId}`)}
                        className="w-full bg-blue-600 text-white h-16 rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-between px-6 font-bold text-lg active:scale-95 transition-transform"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">{cartItems.reduce((a, b) => a + b.quantity, 0)}</div>
                            <span>Savatcha</span>
                        </div>
                        <span>{totalAmount.toLocaleString()} so'm</span>
                    </button>
                </div>
            )}

            {/* Numpad Modal */}
            <NumpadModal
                isOpen={isNumpadOpen}
                onClose={() => setIsNumpadOpen(false)}
                onConfirm={handleNumpadConfirm}
                title={`${selectedProduct?.name} miqdori (${selectedProduct?.unit_type})`}
            />

            {/* Table Orders Modal */}
            <TableOrdersModal
                isOpen={isOrdersModalOpen}
                onClose={() => setIsOrdersModalOpen(false)}
                tableId={tableId}
                tableName={tableName}
            />
        </div>
    );
};

export default Menu;
