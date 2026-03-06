import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const { t } = useTranslation();
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, requestedQuantity = 1) => {
        setCart(prevCart => {
            const existing = prevCart.find(item => item.id === product.id);
            const currentQtyInCart = existing ? existing.cartQuantity : 0;
            const newTotalQty = currentQtyInCart + requestedQuantity;

            // product.quantity is the stock from backend
            if (newTotalQty > product.quantity) {
                alert(t('only_stock_available', { count: product.quantity, unit: product.unit || 'kg', name: product.name }));
                return prevCart;
            }

            if (existing) {
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, cartQuantity: newTotalQty } : item
                );
            }
            return [...prevCart, { ...product, cartQuantity: requestedQuantity, stock: product.quantity }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCart(prevCart => prevCart.map(item => {
            if (item.id === productId) {
                if (newQuantity > item.stock) {
                    alert(t('sorry_only_stock', { count: item.stock, unit: item.unit || 'kg' }));
                    return item;
                }
                return { ...item, cartQuantity: newQuantity };
            }
            return item;
        }));
    };

    const clearCart = () => {
        setCart([]);
    };

    const clearSpecifiedItems = (itemIds) => {
        setCart(prevCart => prevCart.filter(item => !itemIds.includes(item.id)));
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, clearSpecifiedItems, total }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
