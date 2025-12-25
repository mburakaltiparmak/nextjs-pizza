"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { fetchUserOrders } from "@/lib/store/actions/orderActions";
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
import SecondaryLoading from "@/components/secondaryLoading";

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

    const getStatusColor = (status) => {
        const statusColors = {
            PENDING: "bg-yellow text-red",
            PREPARING: "bg-blue-500 text-white",
            READY: "bg-green-500 text-white",
            DELIVERED: "bg-gray text-white",
            CANCELLED: "bg-red text-white",
        };
        return statusColors[status] || "bg-gray text-white";
    };

    const getStatusText = (status) => {
        const statusTexts = {
            PENDING: "Beklemede",
            PREPARING: "Hazırlanıyor",
            READY: "Hazır",
            DELIVERED: "Teslim Edildi",
            CANCELLED: "İptal Edildi",
        };
        return statusTexts[status] || status;
    };

    if (loading) {
        return <SecondaryLoading size="fullPage" />;
    }

    if (!orders || orders.length === 0) {
        return (
            <Card className="border-gray">
                <CardContent className="py-12">
                    <div className="text-center space-y-4">
                        <div className="bg-lightgray rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center">
                            <FontAwesomeIcon
                                icon={faShoppingBag}
                                size="3x"
                                className="text-gray"
                            />
                        </div>
                        <h3 className="text-xl font-bold text-darkgray font-Quattrocento_Sans">
                            Henüz Sipariş Yok
                        </h3>
                        <p className="text-gray font-Barlow">
                            Henüz bir siparişiniz bulunmuyor. İlk siparişinizi vermek için
                            menüyü inceleyin.
                        </p>
                        <Button
                            onClick={() => router.push("/menu")}
                            className="bg-red text-lightgray hover:bg-yellow hover:text-red font-Barlow"
                        >
                            Menüye Git
                        </Button>
                    </div>
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
                                <CardTitle className="text-darkgray font-Quattrocento_Sans">
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
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(
                                    order.status
                                )}`}
                            >
                                {getStatusText(order.status)}
                            </span>
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
