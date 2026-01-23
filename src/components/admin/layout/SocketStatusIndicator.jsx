"use client";

import { useSocket } from "@/lib/providers/SocketProvider";
import { Wifi, WifiOff } from "lucide-react";

export const SocketStatusIndicator = () => {
    const { isConnected } = useSocket();

    return (
        <div className="flex items-center gap-2 text-sm">
            {isConnected ? (
                <>
                    <Wifi className="w-4 h-4 text-green-500 animate-pulse" />
                    <span className="text-green-600 font-medium">Real-time Active</span>
                </>
            ) : (
                <>
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <span className="text-red-600 font-medium">Disconnected</span>
                </>
            )}
        </div>
    );
};
