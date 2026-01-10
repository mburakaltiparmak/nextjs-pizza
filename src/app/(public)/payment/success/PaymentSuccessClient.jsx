"use client";
import React, { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/store/hooks";
import { clearCartAction } from "@/lib/store/actions/orderActions";
import { CheckCircle, Copy } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast"; // Maybe migrate hooks later if needed

const PaymentSuccessClient = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    const orderId = searchParams.get("orderId");

    useEffect(() => {
        // Ödeme başarılı olduğunda sepeti temizle
        if (orderId) {
            dispatch(clearCartAction());
        }
    }, [orderId, dispatch]);

    const handleCopyId = () => {
        if (orderId) {
            navigator.clipboard.writeText(orderId);
            toast({
                title: "Kopyalandı",
                description: "Sipariş numarası panoya kopyalandı.",
                duration: 2000,
            });
        }
    };

    return (
        <div className="min-h-screen bg-offwhite flex flex-col items-center justify-center p-4 font-Barlow relative overflow-hidden">
            {/* Arkaplan dekorasyonları */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red via-yellow to-red animate-pulse"></div>

            <div className="max-w-lg w-full bg-white border-4 border-darkgray shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 relative z-10 transition-transform hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] duration-300">

                <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 border-4 border-darkgray relative">
                        <CheckCircle className="w-12 h-12 text-green-600" strokeWidth={3} />
                        <div className="absolute -right-2 -top-2 bg-yellow text-darkgray font-bold px-2 py-1 border-2 border-darkgray text-xs transform rotate-12">
                            YEY!
                        </div>
                    </div>

                    <h1 className="text-4xl font-black italic text-darkgray mb-2 uppercase tracking-tighter">
                        SİPARİŞ ALINDI!
                    </h1>
                    <p className="text-gray-600 mb-8 font-medium">
                        Ödemeniz başarıyla gerçekleşti. Pizzalarınız fırına girmek için hazırlanıyor!
                    </p>

                    {orderId && (
                        <div className="w-full bg-offwhite border-2 border-dashed border-darkgray p-4 rounded-lg mb-8 relative group overflow-hidden">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Sipariş Takip No</span>
                            <div className="flex items-center justify-center gap-2 bg-white border border-gray-200 p-2 rounded shadow-inner">
                                <span className="font-mono text-sm md:text-base font-bold text-darkgray break-all">
                                    {orderId}
                                </span>
                                <button
                                    onClick={handleCopyId}
                                    className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600 border border-transparent hover:border-gray-300"
                                    title="Numarayı Kopyala"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                *Siparişinizi takip etmek için bu numarayı saklayın.
                            </p>
                        </div>
                    )}

                    <div className="grid gap-4 w-full">
                        <button
                            onClick={() => router.push(`/track-order?id=${orderId || ''}`)}
                            className="w-full bg-red text-white font-black py-4 px-6 border-2 border-darkgray shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] transition-all uppercase tracking-wide flex items-center justify-center gap-2"
                        >
                            Siparişimi Takip Et
                        </button>

                        <button
                            onClick={() => router.push("/orders")}
                            className="w-full bg-yellow text-darkgray font-black py-4 px-6 border-2 border-darkgray shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] transition-all uppercase tracking-wide"
                        >
                            Siparişlerim
                        </button>

                        <button
                            onClick={() => router.push("/")}
                            className="w-full bg-white text-darkgray font-bold py-3 px-6 hover:underline uppercase text-sm tracking-wider mt-2"
                        >
                            Ana Sayfaya Dön
                        </button>
                    </div>
                </div>
            </div>

            {/* Alt bilgi */}
            <div className="mt-8 text-center text-gray-400 text-sm">
                <p>Bir sorun mu var? <a href="/contact" className="underline hover:text-darkgray">Bize Ulaşın</a></p>
            </div>
        </div>
    );
}

export default PaymentSuccessClient;
