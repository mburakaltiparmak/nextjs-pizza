"use client";

import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

export const GlobalLoadingOverlay = () => {
    const loading = useSelector((state) => state.global.loading);

    if (!loading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <div className="relative mb-3">
                    <Loader2 className="h-10 w-10 text-red animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1/3 h-1/3 bg-yellow rounded-full opacity-60"></div>
                    </div>
                </div>
                <p className="text-darkgray font-Barlow font-medium text-sm animate-pulse">
                    İşlem yapılıyor...
                </p>
            </div>
        </div>
    );
};
