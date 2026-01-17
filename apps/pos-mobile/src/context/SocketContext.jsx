import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Socket serverga ulanish
        // Proxy orqali /socket.io ga boradi -> http://localhost:4000
        const newSocket = io('/', {
            path: '/socket.io',
            transports: ['websocket', 'polling'], // Websocket afzal
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            console.log("🟢 Socket Connected:", newSocket.id);
        });

        newSocket.on('connect_error', (err) => {
            console.error("🔴 Socket Connection Error:", err);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            console.log("🔴 Socket Disconnected");
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
