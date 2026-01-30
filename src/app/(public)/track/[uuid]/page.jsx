"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSocket } from "@/lib/providers/SocketProvider";
import { OrderTracker } from "@/components/order/OrderTracker";
import { Loader2 } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";
import { instance as axios } from "@/lib/axios/config"; // Fixed import
import { useAppDispatch } from "@/lib/store/hooks";
import { cancelGuestOrder } from "@/lib/store/actions/orderActions";

export default function TrackOrderPage() {
    const { uuid } = useParams();
    const { socket, isConnected } = useSocket();
    const { toast } = useToast();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Initial Fetch
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // Using the new public endpoint
                const response = await axios.get(`/orders/track/${uuid}`);
                setOrder(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Order fetch error:", err);
                setError("Sipariş bulunamadı veya bir hata oluştu.");
                setLoading(false);
            }
        };

        if (uuid) {
            fetchOrder();
        }
    }, [uuid]);

    // 2. Real-time Updates
    useEffect(() => {
        if (!socket || !isConnected || !order) return;

        const roomName = `order_${uuid}`;

        // Join Room
        socket.emit("join", roomName, (response) => {
            console.log(`Joined room ${roomName}:`, response);
        });

        // Listen for updates
        const handleUpdate = (updatedOrderDto) => {
            console.log("Order update received:", updatedOrderDto);

            setOrder((prev) => ({
                ...prev,
                orderStatus: updatedOrderDto.orderStatus,
                // Update other fields if needed, e.g. estimated time
            }));

            toast({
                title: "Sipariş Güncellendi",
                description: `Yeni Durum: ${updatedOrderDto.orderStatus}`,
                className: "bg-blue-50 border-blue-200 text-blue-900",
            });
        };

        socket.on("order_updated", handleUpdate);

        return () => {
            socket.off("order_updated", handleUpdate);
            // Optional: leave room if needed, but disconnect handles it usually
        };
    }, [socket, isConnected, uuid, order, toast]);


    const dispatch = useAppDispatch(); // Assuming strict hooks or useDispatch
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelEmail, setCancelEmail] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);

    // ... (rest of useEffects)

    const handleCancelOrder = async (e) => {
        e.preventDefault();
        if (!cancelEmail) {
            toast.error("Lütfen e-posta adresinizi girin.");
            return;
        }

        setIsCancelling(true);
        try {
            // Using Redux action for consistency
            const result = await dispatch(cancelGuestOrder(order.uuid, cancelEmail));

            if (result && !result.error) {
                toast.success("Sipariş başarıyla iptal edildi.");
                setOrder(prev => ({ ...prev, orderStatus: 'CANCELLED' }));
                setIsCancelModalOpen(false);
            }
        } catch (err) {
            console.error("Cancel error:", err);
            // Errors handled by action usually, but safe fallback
        } finally {
            setIsCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-red" />
                <span className="ml-2 font-medium text-gray-600">Sipariş aranıyor...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Sipariş Bulunamadı</h1>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <Link href="/" className="bg-red text-white px-6 py-2 rounded-lg hover:bg-red/90 transition">
                        Anasayfaya Dön
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 font-Barlow mb-2">
                        Sipariş Takibi
                    </h1>
                    <p className="text-gray-500">
                        Sipariş No: <span className="font-mono font-bold text-red-500">#{order.uuid}</span>
                    </p>
                </div>

                {/* Tracker Card */}
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-gray-100">

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Sipariş Durumu</h2>
                        {order.orderStatus === 'PENDING' && (
                            <button
                                onClick={() => setIsCancelModalOpen(true)}
                                className="text-sm text-red-600 hover:text-red-800 underline font-medium"
                            >
                                Siparişi İptal Et
                            </button>
                        )}
                    </div>

                    <OrderTracker status={order.orderStatus} />

                    {/* Order Details Summary */}
                    <div className="mt-10 pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Teslimat Bilgileri</h3>
                            <p className="font-medium text-gray-900">{order.customerName}</p>
                            <p className="text-gray-500 text-sm mt-1">{order.deliveryAddress?.district}, {order.deliveryAddress?.city}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Sipariş Özeti</h3>
                            <ul className="space-y-2">
                                {order.items?.map((item, idx) => (
                                    <li key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-600">{item.quantity}x {item.productName}</span>
                                        <span className="font-medium text-gray-900">{item.price} ₺</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                                <span className="font-bold text-gray-900">Toplam</span>
                                <span className="font-bold text-xl text-red">{order.totalAmount} ₺</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Cancel Modal */}
            {isCancelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-lg font-bold mb-2">Siparişi İptal Et</h3>
                        <p className="text-gray-600 mb-4 text-sm">
                            Siparişinizi iptal etmek istediğinize emin misiniz? Güvenlik nedeniyle lütfen e-posta adresinizi giriniz.
                        </p>
                        <form onSubmit={handleCancelOrder}>
                            <input
                                type="email"
                                placeholder="E-posta adresi"
                                className="w-full border p-2 rounded mb-4"
                                value={cancelEmail}
                                onChange={(e) => setCancelEmail(e.target.value)}
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCancelModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                    disabled={isCancelling}
                                >
                                    Vazgeç
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                    disabled={isCancelling}
                                >
                                    {isCancelling ? 'İptal Ediliyor...' : 'Onayla ve İptal Et'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
