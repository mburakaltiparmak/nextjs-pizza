"use client";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { instance } from "@/lib/hooks"; // Backend API için instance
import { clearCartAction, saveCartToStorage, setSelectedAddress } from "@/lib/store/actions/orderActions"; // Action'ı import et
import Loading from "../loading";
import NotFound from "../not-found";
import { Home } from "lucide-react";

export default function SuccessPage() {
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
  const isGuest = role === "GUEST";
  const guestData = useAppSelector((state) => state.guest);

  const [latestOrder, setLatestOrder] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    // Sayfa başarıyla render edildi, sepeti temizle
    if (!loading && !error) {
      console.log("Success sayfası yüklendi, sepet temizleniyor...");
      dispatch(clearCartAction());
      saveCartToStorage([]);
    }
  }, [dispatch,loading,error]); 

  // Eğer adres ID'si varsa ve adres nesnesi yoksa, adresi API'den getir
  useEffect(() => {
    const fetchAddressIfNeeded = async () => {
      // Misafir kullanıcılar için API çağrısı yapma
      if (isGuest) return;

      // Adres ID var ama adres nesnesi yok ise
      if (userData?.addressId && !selectedAddress && !addressLoading) {
        try {
          setAddressLoading(true);
          console.log(
            "Adres ID ile adres detayları getiriliyor:",
            userData.addressId
          );

          // API'den adres bilgisini getir
          const response = await instance.get(
            `user/addresses/${userData.addressId}`
          );

          if (response.data) {
            console.log("Adres detayları alındı:", response.data);
            // Redux'ta adresi kaydet
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

  // Debug için tüm veriyi konsola yazdır
  useEffect(() => {
    console.log("Redux state - orderDetail:", orderDetail);
    console.log("Redux state - userData:", userData);
    console.log("Redux state - selectedAddress:", selectedAddress);
    console.log("Redux state - paymentMethod:", paymentMethod);
    console.log("Redux state - role:", role);
    console.log("Redux state - guestData:", guestData);

    if (orderDetail) {
      setLatestOrder(orderDetail);
      console.log("latest order:", latestOrder);
    }
  }, [
    orderDetail,
    userData,
    selectedAddress,
    paymentMethod,
    role,
    guestData,
    latestOrder,
  ]);
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

  // Anasayfaya git fonksiyonu
  const goToHomePage = () => {
    router.push("/");
  };

  // Render loading state if data is being fetched
  if (loading || addressLoading) {
    return <Loading />;
  }

  // Render error message if there was a problem
  if (error) {
    return (
      <div className="bg-red min-h-screen flex flex-col items-center justify-center p-4">
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

  // Render NotFound if no order is available
  if (!latestOrder) {
    return (
      <div className="bg-red min-h-screen flex flex-col items-center justify-center p-4">
        <NotFound />
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
  // Sipariş öğelerini ve toplam tutarı hesapla
  const renderOrderItems = () => {
    if (latestOrder.items && Array.isArray(latestOrder.items)) {
      return latestOrder.items.map((item, index) => (
        <div
          key={index}
          className="flex flex-col justify-start items-start gap-4 font-semibold text-sm "
        >
          <div className="grid grid-cols-3 items-center w-full">
            <span className="flex flex-row items-center gap-1">
              <img
                className="object-cover w-12"
                src={item.product.img}
                alt={item.product?.name || "Ürün"}
              />
              {/*düzelt */}
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

  // Toplam tutarı hesapla
  const calculateTotal = () => {
    if (latestOrder.totalAmount) {
      // Direkt toplam tutar varsa kullan
      return latestOrder.totalAmount;
    } else if (latestOrder.items && Array.isArray(latestOrder.items)) {
      // Siparişte items varsa hesapla
      return latestOrder.items.reduce(
        (total, item) => total + item.quantity * item.price,
        0
      );
    } else if (Array.isArray(latestOrder)) {
      // LatestOrder bir array ise hesapla (cart verisi)
      return latestOrder.reduce(
        (total, item) => total + item.count * (item.product?.price || 0),
        0
      );
    }

    return 0;
  };
  // Teslimat adresini göster
  const getDeliveryAddress = () => {
    // Kapsamlı kontrol yapalım
    console.log("Teslimat adresi kontrolleri:");

    // 1. Öncelikle Redux'ta saklanan seçilmiş adresi kullan
    if (selectedAddress) {
      console.log("1. selectedAddress bulundu:", selectedAddress);
      return `${selectedAddress.fullAddress}, ${selectedAddress.district}/${selectedAddress.city}`;
    }

    // 2. Backend'den gelen siparişte orderAddress varsa
    if (latestOrder && latestOrder.orderAddress) {
      console.log("2. orderAddress bulundu:", latestOrder.orderAddress);
      const address = latestOrder.orderAddress;
      return `${address.fullAddress}, ${address.district}/${address.city}`;
    }

    // 3. Backend'den gelen siparişte address objesi varsa
    if (
      latestOrder &&
      latestOrder.address &&
      typeof latestOrder.address === "object"
    ) {
      console.log("3. address objesi bulundu:", latestOrder.address);
      const address = latestOrder.address;
      return `${address.fullAddress}, ${address.district}/${address.city}`;
    }

    // 4. Backend'den gelen siparişte string adres varsa
    if (
      latestOrder &&
      typeof latestOrder.address === "string" &&
      latestOrder.address
    ) {
      console.log("4. string adres bulundu:", latestOrder.address);
      return latestOrder.address;
    }

    // 5. Redux state'indeki userData içinde adres bilgileri varsa
    if (userData) {
      // 5.1. userAddress objesi varsa
      if (userData.userAddress && typeof userData.userAddress === "object") {
        console.log("5.1. userData.userAddress bulundu:", userData.userAddress);
        const address = userData.userAddress;
        return `${address.fullAddress}, ${address.district}/${address.city}`;
      }

      // 5.2. newAddress objesi varsa
      if (userData.newAddress && typeof userData.newAddress === "object") {
        console.log("5.2. userData.newAddress bulundu:", userData.newAddress);
        const address = userData.newAddress;
        return `${address.fullAddress}, ${address.district}/${address.city}`;
      }

      // 5.3. Sadece adres ID'si varsa
      if (userData.addressId) {
        console.log(
          "5.3. Sadece userData.addressId bulundu:",
          userData.addressId
        );
        return `Kayıtlı Adres (ID: ${userData.addressId})`;
      }
    }

    // 6. Misafir kullanıcı bilgilerinde adres varsa
    if (isGuest && guestData && guestData.address) {
      console.log("6. guestData.address bulundu:", guestData.address);
      const address = guestData.address;
      return `${address.fullAddress}, ${address.district}/${address.city}`;
    }

    console.log("Adres bilgisi bulunamadı");
    return "Belirtilmemiş";
  };

  // Misafir veya normal kullanıcı bilgisi
  const getCustomerInfo = () => {
    if (isGuest && guestData) {
      return `${guestData.name} ${guestData.surname}`;
    } else if (userData && userData.fullname) {
      return userData.fullname;
    } else if (selectedAddress && selectedAddress.recipientName) {
      return selectedAddress.recipientName;
    }
    return "Belirtilmemiş";
  };
  return (
    <div className="bg-red min-h-screen flex flex-col items-center py-8 px-4">
      <div className="flex flex-col items-center gap-4 max-w-md w-full">
        <h3 className="text-2xl font-normal font-Satisfy text-yellow">
          Lezzetin Yolda
        </h3>
        <h2 className="font-Barlow font-extralight text-4xl tracking-tighter text-lightgray text-center">
          SİPARİŞ ALINDI
        </h2>

        <div className="flex flex-col justify-start gap-4 bg-yellow text-red rounded-lg w-full font-Barlow py-4 px-6">
          {/* Sipariş Numarası */}
          {latestOrder.id && (
            <div className="flex flex-row gap-1 justify-center items-center font-normal">
              <span className="">Sipariş Numarası :</span>
              <span className="">{latestOrder.id}</span>
            </div>
          )}
          <Separator orientation="horizontal" className="bg-red" />

          {/* Müşteri Bilgileri - Misafir siparişi için */}
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

          {/* Order Items */}
          <div className="">{renderOrderItems()}</div>
          <Separator orientation="horizontal" className="bg-red" />

          {/* Order Summary */}
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
              <div className="">
                <span>Teslimat Adresi:</span>
                <span className=""> {getDeliveryAddress()}</span>
              </div>
            </div>
          </div>
          <Separator orientation="horizontal" className="bg-red" />

          {/* Order Status */}
          <div className="py-2">
            <div className="">
              <span className="font-semibold bg-red text-yellow px-3 py-1 rounded-full text-sm">
                {getOrderStatusText(latestOrder.orderStatus)}
              </span>
            </div>
          </div>
        </div>

        {/* Anasayfaya Git Butonu */}
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
}
