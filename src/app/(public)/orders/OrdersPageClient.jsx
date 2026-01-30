"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchUserOrders } from "@/lib/store/actions/orderActions";
import { fetchStates } from "@/lib/store/constants";
import { 
    selectUserOrders, 
    selectOrderFetchState, 
    selectOrderError 
} from "@/lib/store/selectors/orderSelectors";
import { EmptyState } from "@/components/common";
import { OrderCard } from "@/components/orders/OrderCard";
import { useToast } from "@/lib/hooks/useToast";
import useAuth from "@/lib/hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faShoppingBag,
    faHome,
    faArrowLeft,
    faSync,
} from "@fortawesome/free-solid-svg-icons";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

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
                                    <OrderCard key={order.id} order={order} />
                                ))}
                            </div>
                        ) : (
                             <EmptyState
                                icon={faShoppingBag}
                                title="Henüz siparişiniz yok"
                                description="Henüz bir sipariş vermemişsiniz veya siparişleriniz yüklenemedi."
                                actionLabel="Alışverişe Başla"
                                onAction={goToHome}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

