import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

/**
 * Socket.io hook - Real-time yangilanishlar uchun
 * @param {Function} onUpdate - Yangilanish kelganda chaqiriladigan funksiya
 */
export function useSocket(onUpdate) {
    const socketRef = useRef(null);
    const onUpdateRef = useRef(onUpdate);

    // Callback ni yangilash
    useEffect(() => {
        onUpdateRef.current = onUpdate;
    }, [onUpdate]);

    useEffect(() => {
        // Joriy sahifa URL sidan server manzilini olish
        const serverUrl = window.location.origin;

        // Socket ulanishini yaratish
        socketRef.current = io(serverUrl, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('🔌 Socket connected:', socket.id);
            // Global updates uchun join qilish
            socket.emit('join-global');
        });

        socket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
        });

        socket.on('update', (data) => {
            console.log('📡 Update received:', data);
            if (onUpdateRef.current) {
                onUpdateRef.current(data);
            }
        });

        socket.on('connect_error', (error) => {
            console.warn('⚠️ Socket connection error:', error.message);
        });

        // Cleanup
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    // Specific hall ga qo'shilish
    const joinHall = useCallback((hallId) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('join-hall', hallId);
        }
    }, []);

    return { joinHall };
}
