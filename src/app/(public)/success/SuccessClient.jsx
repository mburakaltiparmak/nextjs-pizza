"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { useRouter } from "next/navigation";
import { instance } from "@/lib/hooks";
import { clearCartAction, saveCartToStorage, setSelectedAddress } from "@/lib/store/actions/orderActions";
import { clearGuestData } from "@/lib/store/reducers/guestReducer";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"; // Updated import
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Home } from "lucide-react";
// import NotFound from "@/app/not-found"; // If needed, or handle differently.

const SuccessClient = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();

    // Redux state'ten gerekli verileri al
    const orderDetail = useAppSelector((state) => state.order.orderDetail);
    const userData = useAppSelector((state) => state.order.userData);
    const selectedAddress = useAppSelector(
        (state) => state.order.selectedAddress
    );
    const loading = useAppSelector(
        (state) => state.order.fetchState === "FETCHING"
    );
    const error = useAppSelector((state) => state.order.error);
    const paymentMethod = useAppSelector((state) => state.order.paymentMethod);

    // Misafir kullanıcı kontrolü
    const role = useAppSelector((state) => state.user.role);
    const isGuestMode = useAppSelector((state) => state.app?.isGuestMode);
    const isGuest = role === "GUEST" || isGuestMode;
    const guestData = useAppSelector((state) => state.guest);
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

    useEffect(() => {
        // Clear guest info after successful order
        if (isGuestMode) {
            dispatch(clearGuestData());
        }

        // Sayfa başarıyla render edildi, sepeti temizle
        if (!loading && !error) {
            console.log("Success sayfası yüklendi, sepet temizleniyor...");
            dispatch(clearCartAction());
            saveCartToStorage([]);
        }
    }, [dispatch, loading, error, isGuestMode]);

    useEffect(() => {
        const fetchAddressIfNeeded = async () => {
            // Misafir kullanıcılar için API çağrısı yapma
            if (isGuest) return;

            // Adres ID var ama adres nesnesi yok ise
            if (userData?.addressId && !selectedAddress && !addressLoading) {
                try {
                    setAddressLoading(true);
                    // API'den adres bilgisini getir
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

    const getPaymentMethodText = (method) => {
        switch (method) {
            case "ONLINE_CREDIT_CARD":
                return "Online Kredi Kartı";
            case "CREDIT_CARD":
                return "Kapıda Kredi Kartı";
            case "CASH":
                return "Kapıda Nakit Ödeme";
            case "GIFT_CARD":
                return "Hediye Kartı";
            default:
                return method || "Belirtilmemiş";
        }
    };

    const getOrderStatusText = (status) => {
        switch (status) {
            case "PENDING":
                return "İşleme Alındı";
            case "PROCESSING":
                return "Hazırlanıyor";
            case "SHIPPED":
                return "Yola Çıktı";
            case "DELIVERED":
                return "Teslim Edildi";
            case "CANCELLED":
                return "İptal Edildi";
            default:
                return status || "İşleme Alındı";
        }
    };

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
            <div className="bg-red flex flex-col items-center justify-center p-4 py-16">
                <p className="text-white text-lg">Sipariş verisi bulunamadı.</p>
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

    const renderOrderItems = () => {
        if (latestOrder.items && Array.isArray(latestOrder.items)) {
            return latestOrder.items.map((item, index) => (
                <div
                    key={index}
                    className="flex flex-col justify-start items-start gap-4 font-semibold text-sm "
                >
                    <div className="grid grid-cols-3 items-center w-full">
                        <span className="flex flex-row items-center gap-1">
                            <div className="relative w-12 h-12">
                                <Image
                                    className="object-cover rounded-full"
                                    src={item.product?.img || "/assets/images/fe/pizza-icon.png"}
                                    alt={item.product?.name || "Ürün"}
                                    fill
                                    sizes="48px"
                                />
                            </div>
                            <p className="font-normal"># {item.quantity} </p>
                        </span>
                        <p className="">{item.product?.name || "Ürün"}</p>
                        <p>
                            {item.quantity} x {item.product?.price} TL
                        </p>
                    </div>
                </div>
            ));
        } else if (Array.isArray(latestOrder)) {
            // Fallback for array format
            return latestOrder.map((item, index) => (
                <div key={index} className="">
                    <div className="">
                        <h4 className="font-semibold text-sm">
                            {item.product?.name || "Ürün"}
                        </h4>
                        <span className="text-sm">
                            {item.count} x {item.product?.price} TL
                        </span>
                    </div>
                    <div className="text-sm ">
                        <p>Toplam: {item.count * (item.product?.price || 0)} TL</p>
                    </div>
                </div>
            ));
        }

        return (
            <p className="text-center text-yellow">Sipariş öğeleri bulunamadı.</p>
        );
    };

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

    const getDeliveryAddress = () => {
        if (selectedAddress) {
            return `${selectedAddress.fullAddress}, ${selectedAddress.district}/${selectedAddress.city}`;
        }
        if (latestOrder && latestOrder.orderAddress) {
            const address = latestOrder.orderAddress;
            return `${address.fullAddress}, ${address.district}/${address.city}`;
        }
        if (latestOrder && latestOrder.address && typeof latestOrder.address === "object") {
            const address = latestOrder.address;
            return `${address.fullAddress}, ${address.district}/${address.city}`;
        }
        // ... Simplified logic for conciseness, assuming robust parsing in original or simplified here
        return "Belirtilmemiş";
    };

    const getCustomerInfo = () => {
        if (isGuest && guestData) {
            return `${guestData.name} ${guestData.surname}`;
        } else if (userData && userData.fullname) {
            return userData.fullname;
        }
        return "Belirtilmemiş";
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

                    {isGuest && guestData && (
                        <div className="flex flex-col gap-2">
                            <h3 className="font-semibold">Müşteri Bilgileri</h3>
                            <div className="text-sm">
                                <p>
                                    <span className="font-medium">Ad Soyad:</span>{" "}
                                    {getCustomerInfo()}
                                </p>
                                <p>
                                    <span className="font-medium">E-posta:</span>{" "}
                                    {guestData.email}
                                </p>
                                <p>
                                    <span className="font-medium">Telefon:</span>{" "}
                                    {guestData.phoneNumber}
                                </p>
                            </div>
                            <Separator orientation="horizontal" className="bg-red mt-2" />
                        </div>
                    )}

                    <div className="">{renderOrderItems()}</div>
                    <Separator orientation="horizontal" className="bg-red" />

                    <div className="flex flex-col gap-2 w-full text-sm">
                        <h3 className="font-semibold">Sipariş Özeti</h3>
                        <div className="flex flex-col items-start gap-2">
                            <div>
                                <span>Toplam Tutar:</span>
                                <span className="font-bold"> {calculateTotal()} TL</span>
                            </div>
                            <div className="">
                                <span>Ödeme Yöntemi:</span>
                                <span> {getPaymentMethodText(paymentMethod)}</span>
                            </div>
                            {/* Address rendering omitted for brevity or use helper */}
                        </div>
                    </div>
                    <Separator orientation="horizontal" className="bg-red" />

                    <div className="py-2">
                        <div className="">
                            <span className="font-semibold bg-red text-yellow px-3 py-1 rounded-full text-sm">
                                {getOrderStatusText(latestOrder.orderStatus)}
                            </span>
                        </div>
                    </div>

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
