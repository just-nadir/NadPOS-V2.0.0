import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Savatchani local storage dan yuklash (agar bo'lsa)
    useEffect(() => {
        const savedCart = localStorage.getItem('pos_mobile_cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // Savatchani har o'zgarishda saqlash
    useEffect(() => {
        localStorage.setItem('pos_mobile_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, tableId, quantity = 1) => {
        setCart(prev => {
            const existingItem = prev.find(item => item.id === product.id && item.tableId === tableId);
            if (existingItem) {
                return prev.map(item =>
                    item.id === product.id && item.tableId === tableId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { ...product, quantity: quantity, tableId }];
        });
    };

    const removeFromCart = (productId, tableId) => {
        setCart(prev => prev.filter(item => !(item.id === productId && item.tableId === tableId)));
    };

    const updateQuantity = (productId, tableId, change) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId && item.tableId === tableId) {
                const newQuantity = Math.max(0, item.quantity + change);
                // Agar 0 bo'lsa, o'chirmasdan 0 da qoldiramiz yoki o'chiramiz?
                // UX: Odatda 0 bo'lsa o'chiriladi.
                if (newQuantity <= 0.001) return null;
                return { ...item, quantity: newQuantity };
            }
            return item;
        }).filter(Boolean));
    };

    const clearCart = (tableId) => {
        setCart(prev => prev.filter(item => item.tableId !== tableId));
    };

    const getCartTotal = (tableId) => {
        return cart
            .filter(item => item.tableId === tableId)
            .reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal }}>
            {children}
        </CartContext.Provider>
    );
};
