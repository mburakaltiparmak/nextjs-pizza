"use client";
import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { XCircle, AlertTriangle } from "lucide-react";

export default function PaymentFailureClient() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const orderId = searchParams.get("orderId");
    const errorMessage = searchParams.get("error") || "Ödeme işlemi sırasında bir hata oluştu.";

    return (
        <div className="min-h-screen bg-offwhite flex flex-col items-center justify-center p-4 font-Barlow">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center border-2 border-red">
                <div className="flex justify-center mb-6">
                    <XCircle className="w-20 h-20 text-red" />
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-2">Ödeme Başarısız</h1>
                <p className="text-gray-600 mb-6">
                    Maalesef ödeme işleminiz tamamlanamadı.
                </p>

                <div className="bg-red-50 p-4 rounded-md mb-6 border border-red text-left">
                    <div className="flex gap-2 items-start text-red">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold block text-sm mb-1">Hata Detayı:</span>
                            <p className="text-sm font-medium">{errorMessage}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => router.push("/checkout")}
                        className="w-full bg-red text-yellow font-bold py-3 px-6 rounded-md hover:shadow-lg transition block"
                    >
                        TEKRAR DENE
                    </button>

                    <button
                        onClick={() => router.push("/")}
                        className="w-full bg-white text-darkgray font-bold py-3 px-6 rounded-md border-2 border-darkgray hover:bg-gray-50 transition block"
                    >
                        ANA SAYFAYA DÖN
                    </button>
                </div>
            </div>
        </div>
    );
}
