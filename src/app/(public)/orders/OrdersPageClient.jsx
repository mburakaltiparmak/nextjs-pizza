"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchUserOrders } from "@/lib/store/actions/orderActions";
import { fetchStates } from "@/lib/store/constants";
import { useToast } from "@/lib/hooks/useToast";
import useAuth from "@/lib/hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faShoppingBag,
    faCheck,
    faClock,
    faTruck,
    faExclamationCircle,
    faHome,
    faArrowLeft,
    faSync,
    faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"; // Updated import

export default function OrdersPageClient() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { toast } = useToast();

    // Korumalı yerel state ekle
    const [localOrders, setLocalOrders] = useState([]);

    // Auth kontrolü - giriş yapmamış kullanıcıları yönlendir
    const { isAuthenticated, loading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, authLoading, router]);

    // Redux state'inden verileri al
    const reduxOrders = useSelector((state) => {
        // Her durumu kontrol et
        if (!state || !state.order) {
            return [];
        }
        return state.order.orders;
    });

    const orderFetchState = useSelector((state) =>
        state?.order?.fetchState || fetchStates.NOT_FETCHED
    );

    const error = useSelector((state) => state?.order?.error);

    // Doğrudan ve güvenli veri erişimi için - Redux verileri veya yerel verileri kullan
    const orders = Array.isArray(reduxOrders) ? reduxOrders : localOrders;

    // Manuel yenileme için fonksiyon
    const handleRefreshOrders = async () => {
        try {
            const result = await dispatch(fetchUserOrders());

            // Eğer Redux state güncellenemiyorsa, verileri yerel state'te sakla
            if (Array.isArray(result) && result.length > 0) {
                setLocalOrders(result);
            }
        } catch (error) {
            toast({
                title: "Hata",
                description: "Siparişler yüklenirken bir hata oluştu.",
                variant: "destructive",
            });
        }
    };

    // Siparişleri yükle - direkt veriyi yerel state'e de kaydet
    useEffect(() => {
        const fetchData = async () => {
            if (isAuthenticated && !authLoading) {
                try {
                    const result = await dispatch(fetchUserOrders());

                    if (Array.isArray(result) && result.length > 0) {
                        setLocalOrders(result);
                    }
                } catch (error) {
                    console.error("Sipariş yükleme hatası:", error);
                }
            }
        };

        fetchData();
    }, [isAuthenticated, dispatch, authLoading]);

    // Yükleme hatası varsa göster
    useEffect(() => {
        if (error) {
            toast({
                title: "Hata",
                description: error,
                variant: "destructive",
            });
        }
    }, [error, toast]);

    // Sipariş durumuna göre ikon ve renk belirleme
    const getOrderStatusInfo = (status) => {
        switch (status) {
            case "PENDING":
                return { icon: faClock, color: "bg-yellow text-red", text: "İşleme Alındı" };
            case "CONFIRMED":
                return { icon: faCheck, color: "bg-green-600 text-white", text: "Onaylandı" };
            case "PREPARING":
                return { icon: faShoppingBag, color: "bg-blue-600 text-white", text: "Hazırlanıyor" };
            case "SHIPPING":
                return { icon: faTruck, color: "bg-indigo-600 text-white", text: "Yola Çıktı" };
            case "DELIVERED":
                return { icon: faCheck, color: "bg-green-700 text-white", text: "Teslim Edildi" };
            case "CANCELLED":
                return { icon: faExclamationCircle, color: "bg-red text-white", text: "İptal Edildi" };
            default:
                return { icon: faShoppingBag, color: "bg-gray text-white", text: status || "Belirtilmemiş" };
        }
    };

    const formatOrderDate = (dateString) => {
        if (!dateString) return "Tarih belirtilmemiş";

        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (e) {
            return dateString.toString();
        }
    };

    const formatPaymentMethod = (method) => {
        switch (method) {
            case "ONLINE_CREDIT_CARD": return "Online Kredi Kartı";
            case "CREDIT_CARD": return "Kapıda Kredi Kartı";
            case "CASH": return "Kapıda Nakit Ödeme";
            case "GIFT_CARD": return "Hediye Kartı";
            default: return method || "Belirtilmemiş";
        }
    };

    const formatPaymentStatus = (status) => {
        switch (status) {
            case "PENDING": return "Bekliyor";
            case "SUCCESS": return "Başarılı";
            case "FAILED": return "Başarısız";
            default: return status || "Belirtilmemiş";
        }
    };

    const goToHome = () => {
        router.push("/");
    };

    // Yükleniyor durumu - Hem Redux hem yerel state boşsa ve yükleniyor durumdaysa
    if (authLoading || (orderFetchState === fetchStates.FETCHING && !orders.length)) {
        return <LoadingSpinner size="fullPage" />;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8 font-Barlow">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Button
                        onClick={() => router.back()}
                        variant="outline"
                        className="border-gray text-darkgray hover:bg-gray hover:text-white"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Geri
                    </Button>

                    <h1 className="text-3xl font-bold text-center text-darkgray font-Quattrocento_Sans">
                        Siparişlerim
                    </h1>

                    <Button
                        onClick={goToHome}
                        variant="outline"
                        className="border-gray text-darkgray hover:bg-gray hover:text-white"
                    >
                        <FontAwesomeIcon icon={faHome} className="mr-2" />
                        Ana Sayfa
                    </Button>
                </div>

                <Card className="border-gray">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-darkgray font-Quattrocento_Sans">
                                Sipariş Geçmişim
                            </CardTitle>
                            <CardDescription className="text-gray font-Barlow">
                                Geçmiş siparişlerinizi buradan görüntüleyebilirsiniz.
                            </CardDescription>
                        </div>

                        <Button
                            onClick={handleRefreshOrders}
                            variant="outline"
                            className="border-gray text-darkgray hover:bg-gray hover:text-white"
                        >
                            <FontAwesomeIcon icon={faSync} className="mr-2" />
                            Yenile
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {Array.isArray(orders) && orders.length > 0 ? (
                            <div className="space-y-6">
                                {orders.map((order) => (
                                    <div key={order.id} className="border border-gray rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="bg-gray-50 p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                                            <div>
                                                <h3 className="font-semibold text-darkgray">
                                                    Sipariş #{order.id}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {formatOrderDate(order.orderDate)}
                                                </p>
                                            </div>

                                            <div className="mt-2 md:mt-0 flex items-center space-x-2">
                                                {order.orderStatus && (
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusInfo(order.orderStatus).color}`}>
                                                        <FontAwesomeIcon icon={getOrderStatusInfo(order.orderStatus).icon} className="mr-1" />
                                                        {getOrderStatusInfo(order.orderStatus).text}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            {/* Teslimat Adresi */}
                                            {order.deliveryAddress && (
                                                <div className="mb-4 bg-gray-50 p-3 rounded-md">
                                                    <h4 className="font-semibold flex items-center text-sm text-darkgray mb-2">
                                                        <FontAwesomeIcon icon={faLocationDot} className="mr-2 text-red" />
                                                        Teslimat Adresi
                                                        {order.deliveryAddress.addressTitle && (
                                                            <span className="ml-2 px-2 py-0.5 bg-yellow text-red text-xs rounded-full">
                                                                {order.deliveryAddress.addressTitle}
                                                            </span>
                                                        )}
                                                    </h4>
                                                    <p className="text-sm text-gray-700">
                                                        {order.deliveryAddress.recipientName}
                                                    </p>
                                                    <p className="text-sm text-gray-700">
                                                        {order.deliveryAddress.fullAddress}, {order.deliveryAddress.district}/{order.deliveryAddress.city}
                                                    </p>
                                                    {order.deliveryAddress.phoneNumber && (
                                                        <p className="text-sm text-gray-700">
                                                            Tel: {order.deliveryAddress.phoneNumber}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Sipariş Özeti */}
                                            <div className="mb-4">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-700 font-medium">Toplam Tutar:</span>
                                                    <span className="font-bold text-darkgray">{order.totalAmount} TL</span>
                                                </div>

                                                <div className="flex justify-between mt-1">
                                                    <span className="text-gray-700 font-medium">Ödeme Yöntemi:</span>
                                                    <span className="text-darkgray">
                                                        {order.payment ? formatPaymentMethod(order.payment.paymentMethod) : "Belirtilmemiş"}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between mt-1">
                                                    <span className="text-gray-700 font-medium">Ödeme Durumu:</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-white text-xs ${order.payment?.paymentStatus === "SUCCESS" ? "bg-green-600" :
                                                        order.payment?.paymentStatus === "FAILED" ? "bg-red" : "bg-yellow text-red"
                                                        }`}>
                                                        {order.payment ? formatPaymentStatus(order.payment.paymentStatus) : "Belirtilmemiş"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Sipariş İçeriği */}
                                            <div className="mt-2 border-t border-gray-200 pt-3">
                                                <div className="text-sm text-gray-700 mb-2 font-medium">Sipariş İçeriği:</div>
                                                <ul className="space-y-1">
                                                    {order.items && order.items.map((item, index) => (
                                                        <li key={index} className="text-sm flex justify-between items-center">
                                                            <div className="flex items-center">
                                                                {item.product?.img && (
                                                                    <img
                                                                        src={item.product.img}
                                                                        alt={item.product?.name || "Ürün"}
                                                                        className="w-8 h-8 mr-2 object-cover rounded-full"
                                                                    />
                                                                )}
                                                                <span>
                                                                    {item.quantity}x {item.product?.name || "Ürün"}
                                                                </span>
                                                            </div>
                                                            <span className="font-medium">{item.price} TL</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Siparişe Not */}
                                            {order.notes && (
                                                <div className="mt-3 border-t border-gray-200 pt-3">
                                                    <div className="text-sm text-gray-700 mb-1 font-medium">Sipariş Notu:</div>
                                                    <p className="text-sm text-gray-600 italic">{order.notes}</p>
                                                </div>
                                            )}


                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray font-Barlow">
                                <FontAwesomeIcon icon={faShoppingBag} className="text-4xl mb-4 text-gray-400" />
                                <p>Henüz bir sipariş vermemişsiniz veya siparişleriniz yüklenemedi.</p>
                                <div className="flex justify-center gap-4 mt-4">
                                    <Button
                                        onClick={handleRefreshOrders}
                                        className="bg-gray-500 text-white hover:bg-gray-600"
                                    >
                                        <FontAwesomeIcon icon={faSync} className="mr-2" />
                                        Yenile
                                    </Button>

                                    <Button
                                        onClick={goToHome}
                                        className="bg-red text-lightgray hover:bg-yellow hover:text-red font-Barlow"
                                    >
                                        Alışverişe Başla
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
