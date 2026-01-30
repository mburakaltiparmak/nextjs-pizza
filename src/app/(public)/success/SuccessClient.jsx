"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { useRouter } from "next/navigation";
import { instance } from "@/lib/hooks";
import { clearCartAction, saveCartToStorage, setSelectedAddress } from "@/lib/store/actions/orderActions";
import { useGuestMode } from "@/lib/hooks/useGuestMode";
import { 
    selectOrderDetail, 
    selectOrderUserData, 
    selectSelectedAddress, 
    selectOrderFetchState, 
    selectOrderError, 
    selectPaymentMethod 
} from "@/lib/store/selectors/orderSelectors";
import { EmptyState } from "@/components/common";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Separator } from "@/components/ui/separator";
import { Home } from "lucide-react";
import { GuestInfoSection } from "@/components/success/GuestInfoSection";
import { SuccessOrderSummary } from "@/components/success/SuccessOrderSummary";

const SuccessClient = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const orderDetail = useAppSelector(selectOrderDetail);
    const userData = useAppSelector(selectOrderUserData);
    const selectedAddress = useAppSelector(selectSelectedAddress);
    const fetchState = useAppSelector(selectOrderFetchState);
    const loading = fetchState === "FETCHING";
    const error = useAppSelector(selectOrderError);
    const paymentMethod = useAppSelector(selectPaymentMethod);

    const { isGuest, guestData, clearGuest, isGuestMode } = useGuestMode();
    const [latestOrder, setLatestOrder] = useState(null);
    const [addressLoading, setAddressLoading] = useState(false);

    const getCustomerEmail = () => {
        if ((isGuest || isGuestMode) && guestData) {
            return guestData.email;
        } else if (userData && userData.guestEmail) {
            return userData.guestEmail;
        }
        return null;
    };

    const getCustomerInfo = () => {
        if (isGuest && guestData) {
            return `${guestData.name} ${guestData.surname}`;
        } else if (userData && userData.fullname) {
            return userData.fullname;
        }
        return "Belirtilmemiş";
    };

    useEffect(() => {
        if (isGuestMode) {
            clearGuest();
        }

        if (!loading && !error) {
            dispatch(clearCartAction());
            saveCartToStorage([]);
        }
    }, [dispatch, loading, error, isGuestMode, clearGuest]);

    useEffect(() => {
        const fetchAddressIfNeeded = async () => {
            if (isGuest) return;

            if (userData?.addressId && !selectedAddress && !addressLoading) {
                try {
                    setAddressLoading(true);
                    const response = await instance.get(
                        `user/addresses/${userData.addressId}`
                    );

                    if (response.data) {
                        dispatch(setSelectedAddress(response.data));
                    }
                } catch (error) {
                    console.error("Adres detayları alınırken hata:", error);
                } finally {
                    setAddressLoading(false);
                }
            }
        };

        fetchAddressIfNeeded();
    }, [userData, selectedAddress, dispatch, addressLoading, isGuest]);

    useEffect(() => {
        if (orderDetail) {
            setLatestOrder(orderDetail);
        }
    }, [orderDetail]);

    const goToHomePage = () => {
        router.push("/");
    };

    if (loading || addressLoading) {
        return <LoadingSpinner size="fullPage" />;
    }

    if (error) {
        return (
            <div className="bg-red flex flex-col items-center justify-center p-4 py-16">
                <h2 className="text-2xl text-white mb-4">Sipariş Detayı Alınamadı</h2>
                <p className="text-yellow">{error}</p>
                <button
                    onClick={goToHomePage}
                    className="mt-8 bg-yellow text-red py-3 px-8 rounded-md font-semibold flex items-center"
                >
                    <Home className="mr-2" size={18} />
                    Anasayfaya Git
                </button>
            </div>
        );
    }

    if (!latestOrder) {
        return (
            <div className="flex justify-center items-center py-16">
                 <EmptyState
                    title="Sipariş Verisi Bulunamadı"
                    description="Sipariş detaylarına şu an ulaşılamıyor."
                    actionLabel="Anasayfaya Git"
                    onAction={goToHomePage}
                    icon={Home}
                />
            </div>
        );
    }

    const calculateTotal = () => {
        if (latestOrder.totalAmount) {
            return latestOrder.totalAmount;
        } else if (latestOrder.items && Array.isArray(latestOrder.items)) {
            return latestOrder.items.reduce(
                (total, item) => total + item.quantity * item.price,
                0
            );
        } else if (Array.isArray(latestOrder)) {
            return latestOrder.reduce(
                (total, item) => total + item.count * (item.product?.price || 0),
                0
            );
        }
        return 0;
    };

    return (
        <div className="bg-red flex flex-col items-center py-8 px-4 rounded-xl my-4">
            <div className="flex flex-col items-center gap-4 max-w-md w-full">
                <h3 className="text-2xl font-normal font-Satisfy text-yellow">
                    Lezzetin Yolda
                </h3>
                <h2 className="font-Barlow font-extralight text-4xl tracking-tighter text-lightgray text-center">
                    SİPARİŞ ALINDI
                </h2>

                <div className="flex flex-col justify-start gap-4 bg-yellow text-red rounded-lg w-full font-Barlow py-4 px-6">
                    {latestOrder.id && (
                        <div className="flex flex-row gap-1 justify-center items-center font-normal">
                            <span className="">Sipariş Numarası :</span>
                            <span className="">{latestOrder.id}</span>
                        </div>
                    )}
                    <Separator orientation="horizontal" className="bg-red" />

                    <GuestInfoSection 
                        guestData={guestData} 
                        isGuest={isGuest} 
                        userData={userData}
                        getCustomerInfo={getCustomerInfo} 
                    />

                    <SuccessOrderSummary 
                        latestOrder={latestOrder} 
                        paymentMethod={paymentMethod} 
                        calculateTotal={calculateTotal} 
                    />

                    {getCustomerEmail() && (
                        <div className="flex flex-col gap-2 p-3 bg-red text-yellow rounded-lg mt-2 border-t border-yellow/20 pt-4">
                            <p className="text-sm font-medium">📧 Sipariş Takibi</p>
                            <p className="text-xs">
                                Siparişinizi <span className="font-bold">{getCustomerEmail()}</span> email
                                adresi ve sipariş numarası ile takip edebilirsiniz.
                            </p>
                            <button
                                onClick={() => router.push('/track-order')}
                                className="mt-2 px-3 py-1 bg-yellow text-red text-sm font-bold rounded hover:bg-yellow/90 transition-colors w-full sm:w-auto"
                            >
                                Siparişimi Takip Et
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={goToHomePage}
                    className="mt-8 font-Barlow bg-yellow text-red px-8 py-3 rounded-md font-semibold flex items-center hover:bg-darkred hover:text-yellow transition-colors duration-300 border border-transparent hover:border-yellow"
                >
                    <Home className="mr-2" size={18} />
                    Anasayfaya Git
                </button>
            </div>
        </div>
    );
};

export default SuccessClient;
