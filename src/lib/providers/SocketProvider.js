"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Backend URL - Adjust if your socket server is on a different port/path
        // Assuming backend is running on localhost:9092 based on axios config
        const SOCKET_URL = "http://localhost:9092";

        console.log("🔌 [SocketProvider] Initializing Socket.IO connection to:", SOCKET_URL);

        const socketInstance = io(SOCKET_URL, {
            transports: ["polling", "websocket"], // Allow polling fallback
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        // Connection events
        socketInstance.on("connect", () => {
            console.log("🟢 [SocketProvider] Socket connected successfully!");
            console.log("   Socket ID:", socketInstance.id);
            console.log("   Transport:", socketInstance.io.engine.transport.name);
            setIsConnected(true);
        });

        socketInstance.on("disconnect", (reason) => {
            console.log("🔴 [SocketProvider] Socket disconnected. Reason:", reason);
            setIsConnected(false);
        });

        socketInstance.on("connect_error", (error) => {
            console.error("⚠️ [SocketProvider] Socket connection error:", error.message);
            console.error("   Error details:", error);
            setIsConnected(false);
        });

        socketInstance.on("reconnect_attempt", (attemptNumber) => {
            console.log(`🔄 [SocketProvider] Reconnection attempt #${attemptNumber}`);
        });

        socketInstance.on("reconnect", (attemptNumber) => {
            console.log(`✅ [SocketProvider] Reconnected after ${attemptNumber} attempts`);
        });

        socketInstance.on("reconnect_failed", () => {
            console.error("❌ [SocketProvider] Reconnection failed after all attempts");
        });

        // Debug: Log all incoming events
        socketInstance.onAny((eventName, ...args) => {
            console.log(`📡 [SocketProvider] Incoming event: "${eventName}"`, args);
        });

        // Debug: Log all outgoing events
        const originalEmit = socketInstance.emit.bind(socketInstance);
        socketInstance.emit = function (eventName, ...args) {
            console.log(`📤 [SocketProvider] Outgoing event: "${eventName}"`, args);
            return originalEmit(eventName, ...args);
        };

        setSocket(socketInstance);

        console.log("✅ [SocketProvider] Socket instance created and set");

        return () => {
            console.log("🧹 [SocketProvider] Cleaning up socket connection");
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
