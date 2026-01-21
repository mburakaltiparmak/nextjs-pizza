"use client";

import { Loader2 } from "lucide-react";

export const ContentLoadingSpinner = () => {
    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px] transition-all duration-300">
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <Loader2 className="h-10 w-10 text-red animate-spin mb-2" />
                <p className="text-darkgray font-Barlow font-medium text-sm animate-pulse">
                    Yükleniyor...
                </p>
            </div>
        </div>
    );
};
