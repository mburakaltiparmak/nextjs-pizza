"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { fetchUserOrders } from "@/lib/store/actions/orderActions";
import { OrderStatusBadge, EmptyState } from "@/components/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingBag, faEye } from "@fortawesome/free-solid-svg-icons";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export const OrderHistoryTab = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            setLoading(true);
            try {
                const result = await dispatch(fetchUserOrders());
                if (result && !result.error) {
                    setOrders(result);
                }
            } catch (error) {
                console.error("Siparişler yüklenirken hata:", error);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [dispatch]);

    // Merkezi sabitler direkt JSX içinde kullanılacak

    if (loading) {
        return <LoadingSpinner size="fullPage" />;
    }

    if (!orders || orders.length === 0) {
        return (
            <Card className="border-gray">
                <CardContent className="py-12">
                     <EmptyState
                        title="Henüz Sipariş Yok"
                        description="Henüz bir siparişiniz bulunmuyor. İlk siparişinizi vermek için menüyü inceleyin."
                        actionLabel="Menüye Git"
                        onAction={() => router.push("/menu")}
                        icon={faShoppingBag}
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <Card
                    key={order.id}
                    className="border-gray hover:shadow-lg transition-shadow"
                >
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-darkgray font-Barlow">
                                    Sipariş #{order.id}
                                </CardTitle>
                                <CardDescription className="text-gray font-Barlow">
                                    {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </CardDescription>
                            </div>
                            <OrderStatusBadge status={order.status} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray font-Barlow">Ürün Sayısı:</span>
                                <span className="font-semibold text-darkgray font-Barlow">
                                    {order.items?.length || 0} ürün
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray font-Barlow">Toplam Tutar:</span>
                                <span className="font-bold text-red font-Barlow">
                                    {order.totalAmount?.toFixed(2)} ₺
                                </span>
                            </div>
                            {order.items && order.items.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-lightgray2">
                                    <p className="text-sm text-gray font-Barlow mb-2">Ürünler:</p>
                                    <ul className="space-y-1">
                                        {order.items.slice(0, 3).map((item, index) => (
                                            <li
                                                key={index}
                                                className="text-sm text-darkgray font-Barlow"
                                            >
                                                • {item.product?.name || "Ürün"} x {item.quantity}
                                            </li>
                                        ))}
                                        {order.items.length > 3 && (
                                            <li className="text-sm text-gray font-Barlow italic">
                                                ... ve {order.items.length - 3} ürün daha
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            onClick={() => router.push(`/orders/${order.id}`)}
                            className="w-full bg-yellow text-red hover:bg-red hover:text-yellow font-Barlow"
                        >
                            <FontAwesomeIcon icon={faEye} className="mr-2" />
                            Detayları Gör
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};
