"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchUserOrders } from "@/lib/store/actions/orderActions";
import { fetchStates } from "@/lib/store/constants";
import { 
    getOrderStatusConfig, 
    getPaymentMethodDisplay, 
    PAYMENT_STATUS_CONFIG 
} from "@/lib/constants";
import { 
    selectUserOrders, 
    selectOrderFetchState, 
    selectOrderError 
} from "@/lib/store/selectors/orderSelectors";
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
import Image from "next/image";
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
    const reduxOrders = useSelector(selectUserOrders);
    const orderFetchState = useSelector(selectOrderFetchState);
    const error = useSelector(selectOrderError);

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

    // Sipariş durumuna göre ikon ve renk belirleme - Merkezi sabitten al
    const getOrderStatusInfo = (status) => {
        const config = getOrderStatusConfig(status);
        // Map string icon to FontAwesome if needed, or just use config properties directly
        // For now, adapting to retain FontAwesome usage or simplify
        // Let's simplify and use the centralized text/color, but we might need to map icons if we want to keep FontAwesome
        return {
           color: config.color,
           text: config.label,
           // Fallback icon logic if needed or just use generic
           icon: faShoppingBag
        };
    };

    // Helper yerine direkt importları kullanacağız, ancak JSX içinde kolay kullanım için:
    // formatPaymentMethod -> getPaymentMethodDisplay
    // formatPaymentStatus -> PAYMENT_STATUS_CONFIG[status].label

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

                    <h1 className="text-3xl font-bold text-center text-darkgray font-Barlow">
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
                            <CardTitle className="text-darkgray font-Barlow">
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
                                                        {order.payment ? getPaymentMethodDisplay(order.payment.paymentMethod) : "Belirtilmemiş"}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between mt-1">
                                                    <span className="text-gray-700 font-medium">Ödeme Durumu:</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-white text-xs ${PAYMENT_STATUS_CONFIG[order.payment?.paymentStatus]?.color || "bg-gray-400"}`}>
                                                        {order.payment ? (PAYMENT_STATUS_CONFIG[order.payment.paymentStatus]?.label || order.payment.paymentStatus) : "Belirtilmemiş"}
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
                                                                    <div className="relative w-8 h-8 mr-2 flex-shrink-0">
                                                                        <Image
                                                                            src={item.product.img}
                                                                            alt={item.product?.name || "Ürün"}
                                                                            fill
                                                                            sizes="32px"
                                                                            className="object-cover rounded-full"
                                                                        />
                                                                    </div>
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
