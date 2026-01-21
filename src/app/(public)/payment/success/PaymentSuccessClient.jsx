"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/store/hooks";
import { clearCartAction } from "@/lib/store/actions/orderActions";
import { CheckCircle, Copy, ArrowRight, Home, ShoppingBag, Truck } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";
import { instance } from "@/lib/hooks"; // Correct import
import { motion } from "framer-motion";

const PaymentSuccessClient = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    // Backend now sends Order UUID directly in callback (either as 'uuid' or 'orderId' param)
    const orderUuid = searchParams.get("uuid") || searchParams.get("orderId");

    useEffect(() => {
        // Ödeme başarılı olduğunda sepeti temizle
        if (orderUuid) {
            dispatch(clearCartAction());
        }
    }, [orderUuid, dispatch]);

    const handleCopyId = () => {
        if (orderUuid) {
            navigator.clipboard.writeText(orderUuid);
            toast.success("Sipariş numarası panoya kopyalandı.", {
                title: "Kopyalandı",
                duration: 2000,
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-Barlow relative overflow-hidden">
            {/* Background Pattern - Subtle */}
            <div className="absolute inset-0 z-0 opacity-30 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden relative z-10 border border-gray-100"
            >
                {/* Header Decoration */}
                <div className="h-2 w-full bg-gradient-to-r from-green-400 to-emerald-500"></div>

                <div className="p-8 flex flex-col items-center text-center">
                    {/* Icon Animation */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                        className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-50/50"
                    >
                        <CheckCircle className="w-10 h-10 text-green-500" strokeWidth={3} />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl font-bold text-gray-900 mb-2 font-Barlow"
                    >
                        Siparişiniz Alındı!
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-500 mb-8 max-w-[280px] leading-relaxed"
                    >
                        Tebrikler! Ödemeniz başarıyla gerçekleşti. En kısa sürede kapınızdayız.
                    </motion.p>

                    {orderUuid && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="w-full bg-gray-50 border border-gray-200 border-dashed rounded-xl p-4 mb-8 relative group active:scale-[0.99] transition-transform"
                        >
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5 block">Sipariş Takip No</span>
                            <div className="flex items-center justify-between gap-3">
                                <span className="font-mono text-lg font-bold text-gray-800 break-all pl-2">
                                    {orderUuid}
                                </span>
                                <button
                                    onClick={handleCopyId}
                                    className="p-2 hover:bg-white rounded-lg transition-colors text-gray-500 hover:text-green-600 hover:shadow-sm"
                                    title="Numarayı Kopyala"
                                >
                                    <Copy size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    <div className="grid gap-3 w-full">
                        <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            onClick={() => router.push(`/track/${orderUuid || ''}`)}
                            className="w-full bg-red text-white font-bold py-3.5 px-6 rounded-xl hover:bg-darkred hover:shadow-lg hover:shadow-red/20 active:translate-y-[1px] transition-all flex items-center justify-center gap-2 group"
                        >
                            <Truck size={20} />
                            <span>Siparişimi Takip Et</span>
                            <ArrowRight size={18} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        </motion.button>



                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            onClick={() => router.push("/")}
                            className="w-full text-gray-500 font-semibold py-3 px-6 hover:text-darkgray hover:bg-gray-50 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 mt-2"
                        >
                            <Home size={16} />
                            Ana Sayfaya Dön
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="mt-8 text-center text-gray-400 text-xs relative z-10"
            >
                <p>Yardıma mı ihtiyacınız var? <a href="/contact" className="underline hover:text-gray-600 transition-colors">Bize Ulaşın</a></p>
            </motion.div>
        </div>
    );
}

export default PaymentSuccessClient;
