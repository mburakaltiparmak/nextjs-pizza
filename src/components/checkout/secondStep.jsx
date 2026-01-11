"use client";
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setPaymentMethod, setUserData } from "@/lib/store/actions/orderActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, CreditCard, Banknote, GiftIcon, UserIcon } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";

const SecondStep = ({ setCurrentStep, setStep2 }) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  // Redux'tan gerekli verileri al
  const paymentMethod = useAppSelector((state) => state.order.paymentMethod || "CASH");
  const cart = useAppSelector((state) => state.order.cart);
  const isAuthenticated = useAppSelector((state) => state.user?.isLogin) || false;
  const role = useAppSelector((state) => state.user.role);
  const isGuest = role === "GUEST";
  const guestData = useAppSelector((state) => state.guest);
  const userData = useAppSelector((state) => state.order.userData);
  const selectedAddress = useAppSelector((state) => state.order.selectedAddress);

  const [selectedTab, setSelectedTab] = useState("default");

  // Toplam tutarları hesapla
  const totalItems = cart.reduce((sum, item) => sum + item.count, 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.count), 0);

  useEffect(() => {
    setSelectedTab("default");
  }, [isAuthenticated, isGuest]);

  const handlePaymentMethodSelect = (method) => {
    dispatch(setPaymentMethod(method));
  };

  const handleContinue = () => {
    if (!paymentMethod) {
      toast.error("Ödeme yöntemi seçilmedi", {
        title: "Hata"
      });
      return;
    }

    if (isGuest) {
      if (!guestData.name || !guestData.surname || !guestData.email || !guestData.phoneNumber) {
        toast.error("Lütfen önceki adımda tüm kişisel bilgilerinizi doldurun.", {
          title: "Eksik bilgi"
        });
        setCurrentStep(1);
        return;
      }
    }

    if (!selectedAddress) {
      toast.error("Lütfen önceki adımda bir teslimat adresi belirtin.", {
        title: "Adres bilgisi eksik"
      });
      setCurrentStep(1);
      return;
    }

    setStep2(true);
    setCurrentStep(3);

    toast.success("Şimdi siparişinizi tamamlayabilirsiniz.", {
      title: "Ödeme yöntemi seçildi"
    });
  };

  const renderUserInfo = () => {
    if (isGuest && guestData) {
      return (
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <h3 className="text-md font-semibold mb-2">Misafir Bilgileri</h3>
          <p className="text-sm"><span className="font-medium">Ad Soyad:</span> {guestData.name} {guestData.surname}</p>
          <p className="text-sm"><span className="font-medium">E-posta:</span> {guestData.email}</p>
          <p className="text-sm"><span className="font-medium">Telefon:</span> {guestData.phoneNumber}</p>
          <button
            onClick={() => setCurrentStep(1)}
            className="mt-2 text-xs text-red underline"
          >
            Düzenle
          </button>
        </div>
      );
    }
    return null;
  };

  const renderAddressInfo = () => {
    if (selectedAddress) {
      return (
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <h3 className="text-md font-semibold mb-2">Teslimat Adresi</h3>
          <p className="text-sm"><span className="font-medium">Alıcı:</span> {selectedAddress.recipientName}</p>
          <p className="text-sm"><span className="font-medium">Adres:</span> {selectedAddress.fullAddress}</p>
          <p className="text-sm"><span className="font-medium">İlçe/Şehir:</span> {selectedAddress.district}, {selectedAddress.city}</p>
          {selectedAddress.phoneNumber && (
            <p className="text-sm"><span className="font-medium">Telefon:</span> {selectedAddress.phoneNumber}</p>
          )}
          <button
            onClick={() => setCurrentStep(1)}
            className="mt-2 text-xs text-red underline"
          >
            Değiştir
          </button>
        </div>
      );
    }
    return null;
  };

  // Sipariş özetini gösterme
  const renderOrderSummary = () => {
    if (cart.length === 0) return null;

    return (
      <div className="mb-6 p-4 border rounded-md bg-gray-50">
        <h3 className="text-md font-semibold mb-3">Sipariş Özeti</h3>

        {/* Ürün listesi */}
        <div className="space-y-2 mb-3">
          {cart.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{item.count}x</span>
                <span>{item.product.name}</span>
              </div>
              <span>{(item.product.price * item.count).toFixed(2)} ₺</span>
            </div>
          ))}
        </div>

        {/* Özet bilgiler */}
        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between text-sm mb-1">
            <span>Toplam Ürün:</span>
            <span>{totalItems}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold">
            <span>Toplam Tutar:</span>
            <span className="text-red">{totalAmount.toFixed(2)} ₺</span>
          </div>
        </div>

        <button
          onClick={() => setCurrentStep(1)}
          className="mt-3 text-xs text-red underline"
        >
          Sepeti Düzenle
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden font-Barlow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">
          Ödeme Bilgileri
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Sipariş özetinizi kontrol edin ve bir ödeme yöntemi seçin.
        </p>

        {/* Tüm özet bilgiler */}
        {renderOrderSummary()}
        {isGuest && renderUserInfo()}
        {renderAddressInfo()}

        {/* Ödeme Seçenekleri */}
        <div>
          <h3 className="text-lg font-medium mb-4">Ödeme Yöntemi</h3>
          <div className="grid gap-3">
            <button
              type="button"
              className={`flex items-center border p-3 rounded-md ${paymentMethod === "ONLINE_CREDIT_CARD"
                ? "border-yellow bg-darkred text-yellow"
                : "border-gray-300 hover:border-gray-400"
                }`}
              onClick={() => handlePaymentMethodSelect("ONLINE_CREDIT_CARD")}
            >
              <CreditCard className="mr-3" size={20} />
              <span>Online Kredi Kartı</span>
            </button>

            <button
              type="button"
              className={`flex items-center border p-3 rounded-md ${paymentMethod === "CREDIT_CARD"
                ? "border-yellow bg-darkred text-yellow"
                : "border-gray-300 hover:border-gray-400"
                }`}
              onClick={() => handlePaymentMethodSelect("CREDIT_CARD")}
            >
              <CreditCard className="mr-3" size={20} />
              <span>Kapıda Kredi Kartı</span>
            </button>

            <button
              type="button"
              className={`flex items-center border p-3 rounded-md ${paymentMethod === "CASH"
                ? "border-yellow bg-darkred text-yellow"
                : "border-gray-300 hover:border-gray-400"
                }`}
              onClick={() => handlePaymentMethodSelect("CASH")}
            >
              <Banknote className="mr-3" size={20} />
              <span>Kapıda Nakit Ödeme</span>
            </button>

            {!isGuest && (
              <button
                type="button"
                className={`flex items-center border p-3 rounded-md ${paymentMethod === "GIFT_CARD"
                  ? "border-yellow bg-darkred text-yellow"
                  : "border-gray-300 hover:border-gray-400"
                  }`}
                onClick={() => handlePaymentMethodSelect("GIFT_CARD")}
              >
                <GiftIcon className="mr-3" size={20} />
                <span>Yemek Kartı</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 flex justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="flex items-center font-semibold gap-2 px-6 py-2 rounded-md border border-darkgray bg-white text-darkgray shadow-md hover:shadow-lg "
        >
          <ChevronLeft className="w-5 h-5" />
          GERİ
        </button>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!paymentMethod}
          className={`flex items-center font-semibold gap-2 px-6 py-2 rounded-md ${paymentMethod
            ? "bg-yellow text-red hover:bg-red hover:text-yellow border border-transparent hover:border-yellow"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
        >
          DEVAM
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SecondStep;