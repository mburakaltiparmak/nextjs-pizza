"use client";
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setPaymentMethod, setUserData } from "@/lib/store/actions/orderActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, CreditCard, Banknote, GiftIcon, UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SecondStep = ({ setCurrentStep, setStep2 }) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const paymentMethod = useAppSelector((state) => state.order.paymentMethod || "CASH");
  const isAuthenticated = useAppSelector((state) => state.user?.isLogin) || false;
  const role = useAppSelector((state) => state.user.role);
  const isGuest = role === "GUEST";
  
  // Guest bilgilerini Redux'tan al
  const guestData = useAppSelector((state) => state.guest);
  
  // Adres bilgilerini Redux'tan al
  const userData = useAppSelector((state) => state.order.userData);
  const selectedAddress = useAppSelector((state) => state.order.selectedAddress);
  
  const [selectedTab, setSelectedTab] = useState("default");

  // Kullanıcı durumuna göre tab'ı güncelle
  useEffect(() => {
    // Artık sadece default tab kullanılacak çünkü guest bilgileri
    // birinci adımda dolduruldu
    setSelectedTab("default");
  }, [isAuthenticated, isGuest]);

  // Ödeme yöntemi seçimi
  const handlePaymentMethodSelect = (method) => {
    dispatch(setPaymentMethod(method));
  };

  // Devam et butonuna basıldığında
  const handleContinue = () => {
    // Ödeme yöntemi kontrolü
    if (!paymentMethod) {
      toast({
        title: "Ödeme yöntemi seçilmedi",
        description: "Lütfen bir ödeme yöntemi seçin.",
        variant: "destructive"
      });
      return;
    }
    
    // Misafir kullanıcı bilgilerinin kontrolü
    if (isGuest) {
      // Tüm gerekli misafir bilgilerinin dolu olduğunu kontrol et
      if (!guestData.name || !guestData.surname || !guestData.email || !guestData.phoneNumber) {
        toast({
          title: "Eksik bilgi",
          description: "Lütfen önceki adımda tüm kişisel bilgilerinizi doldurun.",
          variant: "destructive"
        });
        setCurrentStep(1); // Kişisel bilgilerin olduğu adıma geri dön
        return;
      }
    }
    
    // Adres bilgilerinin kontrolü
    if (!selectedAddress) {
      toast({
        title: "Adres bilgisi eksik",
        description: "Lütfen önceki adımda bir teslimat adresi belirtin.",
        variant: "destructive"
      });
      setCurrentStep(1); // Adres seçiminin olduğu adıma geri dön
      return;
    }

    // Her şey tamamsa, bir sonraki adıma geç
    setStep2(true);
    setCurrentStep(3);
    
    toast({
      title: "Ödeme yöntemi seçildi",
      description: "Şimdi siparişinizi tamamlayabilirsiniz."
    });
  };

  // Kullanıcı bilgilerini gösterme
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

  // Adres bilgilerini gösterme
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden font-Barlow">
      {/* Başlık ve Açıklama */}
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">
          Ödeme Bilgileri
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Lütfen bir ödeme yöntemi seçin.
        </p>

        {/* Kullanıcı ve Adres Bilgileri Özeti */}
        {isGuest && renderUserInfo()}
        {renderAddressInfo()}

        {/* Ödeme Seçenekleri */}
        <div>
          <h3 className="text-lg font-medium mb-4">Ödeme Yöntemi</h3>
          <div className="grid gap-3">
            <button
              type="button"
              className={`flex items-center border p-3 rounded-md ${
                paymentMethod === "ONLINE_CREDIT_CARD"
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
              className={`flex items-center border p-3 rounded-md ${
                paymentMethod === "CREDIT_CARD"
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
              className={`flex items-center border p-3 rounded-md ${
                paymentMethod === "CASH"
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
                className={`flex items-center border p-3 rounded-md ${
                  paymentMethod === "GIFT_CARD"
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
      
      {/* Alt Butonlar */}
      <div className="px-6 py-4 bg-gray-50 flex justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="flex items-center font-semibold gap-2 px-6 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          <ChevronLeft className="w-5 h-5" />
          GERİ
        </button>
        
        <button
          type="button"
          onClick={handleContinue}
          disabled={!paymentMethod}
          className={`flex items-center font-semibold gap-2 px-6 py-2 rounded-md ${
            paymentMethod
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