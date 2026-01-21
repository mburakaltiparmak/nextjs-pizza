"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/store/hooks';
import { fetchGuestOrderDetail } from '@/lib/store/actions/orderActions';
import { useSocket } from '@/lib/providers/SocketProvider';
import { useToast } from '@/lib/hooks/useToast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
// Header and Footer are provided by the layout

export default function TrackOrderClient() {
    const searchParams = useSearchParams();
    const [orderId, setOrderId] = useState(searchParams.get('id') || '');
    const [email, setEmail] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const dispatch = useAppDispatch();

    const { toast } = useToast();
    const { socket } = useSocket();

    // Listen for real-time updates
    useEffect(() => {
        if (!order || !socket) return;

        const handleOrderUpdate = (data) => {
            console.log("📥 Socket event received (order_updated):", data);

            // Check if update is for current order
            // Adapting to potential backend response structure (id or orderId)
            const updateId = data.id || data.orderId;

            // Type check: ensure both are strings or both are numbers for comparison
            if (String(updateId) === String(order.id)) {
                setOrder((prev) => ({
                    ...prev,
                    ...data,
                    orderStatus: data.orderStatus || data.status || prev.orderStatus
                }));

                toast({
                    title: "Sipariş Güncellendi",
                    description: `Sipariş durumu güncellendi: ${data.orderStatus || data.status}`,
                    className: "bg-blue-50 border-blue-200 text-blue-900"
                });
            }
        };

        socket.on('order_updated', handleOrderUpdate);

        return () => {
            socket.off('order_updated', handleOrderUpdate);
        };
    }, [order, socket, toast]);

    const router = useRouter();

    const handleTrackOrder = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setOrder(null);

        try {
            const result = await dispatch(fetchGuestOrderDetail(orderId, email));

            if (result.error) {
                setError(result.error);
            } else if (result.uuid) {
                // Best Practice: Redirect to the secure tracking page
                router.push(`/track/${result.uuid}`);
            } else {
                // Fallback for orders without UUID (if any)
                setOrder(result);
            }
        } catch (err) {
            setError('Sipariş bulunamadı. Lütfen bilgilerinizi kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-grow py-12 px-4 font-Barlow min-h-screen bg-lightgray">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-darkgray mb-2">
                            Siparişimi Takip Et
                        </h1>
                        <p className="text-gray">
                            Sipariş numaranız ve email adresinizle siparişinizi sorgulayın
                        </p>
                    </div>

                    <form onSubmit={handleTrackOrder} className="space-y-6">
                        <div>
                            <Label htmlFor="orderId" className="text-darkgray font-medium">Sipariş Numarası</Label>
                            <Input
                                id="orderId"
                                type="text"
                                placeholder="Örn: 12345 veya CHECKOUT_..."
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                required
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="email" className="text-darkgray font-medium">Email Adresi</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="ornek@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-2"
                            />
                            <p className="text-sm text-gray mt-1">
                                Sipariş verirken kullandığınız email adresi
                            </p>
                        </div>

                        {error && (
                            <div className="p-4 bg-red/10 border border-red/20 rounded-lg">
                                <p className="text-red text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-yellow text-red hover:bg-red hover:text-yellow font-bold text-lg h-12"
                        >
                            <Search className="w-5 h-5 mr-2" />
                            {loading ? 'Sorgulanıyor...' : 'Siparişi Sorgula'}
                        </Button>
                    </form>

                    {/* Inline display removed - Redirects to /track/[uuid] */}
                    {order && !order.uuid && (
                        <div className="mt-8 p-6 bg-yellow/10 rounded-xl border border-yellow">
                            <h2 className="text-xl font-bold mb-2 text-darkgray">Uyarı</h2>
                            <p className="text-darkgray">
                                Bu sipariş eski bir versiyonda oluşturulmuş ve takip ID'si (UUID) bulunmuyor.
                                Durum: <b>{order.orderStatus}</b>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
