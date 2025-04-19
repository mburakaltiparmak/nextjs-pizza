"use client";
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setPaymentMethod, setUserData } from "@/lib/store/actions/orderActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, CreditCard, Banknote, GiftIcon, UserIcon } from "lucide-react";
import GuestInformationForm from "./GuestInformationForm";

const SecondStep = ({ setCurrentStep, setStep2 }) => {
  const dispatch = useAppDispatch();
  const paymentMethod = useAppSelector((state) => state.order.paymentMethod || "CASH");
  const isAuthenticated = useAppSelector((state) => state.user?.isLogin) || false;
  
  const [selectedTab, setSelectedTab] = useState(isAuthenticated ? "default" : "guest");
  const [guestInfo, setGuestInfo] = useState(null);

  // Kullanıcı girişi değişikliğinde tab'ı güncelle
  useEffect(() => {
    setSelectedTab(isAuthenticated ? "default" : "guest");
  }, [isAuthenticated]);

  // Ödeme yöntemi seçimi
  const handlePaymentMethodSelect = (method) => {
    dispatch(setPaymentMethod(method));
  };

  // Misafir bilgileri gönderimi
  const handleGuestInfoSubmit = (guestData) => {
    setGuestInfo(guestData);
  };

  // Devam et butonuna basıldığında
  const handleContinue = () => {
    // Kullanıcı oturum açmışsa
    if (isAuthenticated) {
      // Ödeme yöntemi seçilmişse devam et
      if (paymentMethod) {
        setStep2(true);
        setCurrentStep(3);
      } else {
        alert("Lütfen bir ödeme yöntemi seçin.");
      }
    } 
    // Misafir siparişi
    else if (guestInfo) {
      // Misafir bilgilerini kaydet
      dispatch(
        setUserData({
          guestEmail: guestInfo.guestEmail,
          guestPhone: guestInfo.guestPhone
        })
      );
      setStep2(true);
      setCurrentStep(3);
    } 
    // Gerekli bilgiler eksik
    else {
      alert("Lütfen gerekli bilgileri doldurun.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden font-Barlow">
      {/* Başlık ve Açıklama */}
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">
          {isAuthenticated ? "Ödeme Bilgileri" : "Misafir Siparişi"}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {isAuthenticated
            ? "Ödeme şeklinizi seçin."
            : "Sipariş bilgilerinizi girin veya oturum açın."}
        </p>

        {/* Oturum Açma / Misafir Sekmeler */}
        <Tabs
          defaultValue={isAuthenticated ? "default" : "guest"}
          value={selectedTab}
          onValueChange={setSelectedTab}
        >
          <TabsContent value="default">
            <div>
              {/* Ödeme Seçenekleri */}
              <div>
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
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="guest">
            <div className="space-y-6">
              {/* Misafir Bilgi Formu */}
              {!guestInfo ? (
                <div>
                  <h3 className="text-lg font-medium mb-4">İletişim Bilgileri</h3>
                  <GuestInformationForm onSubmit={handleGuestInfoSubmit} />
                </div>
              ) : (
                <div className="border p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">İletişim Bilgileri</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">E-posta:</span> {guestInfo.guestEmail}</p>
                    <p><span className="font-medium">Telefon:</span> {guestInfo.guestPhone}</p>
                  </div>
                  <button
                    onClick={() => setGuestInfo(null)}
                    className="mt-3 text-sm text-red underline"
                  >
                    Düzenle
                  </button>
                </div>
              )}
              
              {/* Misafir ödeme seçenekleri */}
              {guestInfo && (
                <div className="mt-6">
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
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
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
          disabled={
            (isAuthenticated && !paymentMethod) || 
            (!isAuthenticated && !guestInfo)
          }
          className={`flex items-center font-semibold gap-2 px-6 py-2 rounded-md ${
            (isAuthenticated && paymentMethod) || 
            (!isAuthenticated && guestInfo)
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