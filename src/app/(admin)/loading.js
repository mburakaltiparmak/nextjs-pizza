"use client";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function AdminLoading() {
    return (
        <div className="flex items-center justify-center w-full h-[calc(100vh-100px)]">
            <LoadingSpinner size="large" text="Sayfa Yükleniyor..." />
        </div>
    );
}
