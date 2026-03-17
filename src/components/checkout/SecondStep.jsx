"use client";
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setPaymentMethod } from "@/lib/store/actions/orderActions";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";
import { selectPaymentMethod, selectCartItems, selectOrderUserData, selectSelectedAddress } from "@/lib/store/selectors/orderSelectors";
import { selectIsAuthenticated, selectUserRole } from "@/lib/store/selectors/userSelectors";
import { selectGuestData } from "@/lib/store/selectors/guestSelectors";
import { AddressSummary } from "@/components/common";

import PaymentMethodSelector from "./PaymentMethodSelector";
import CheckoutOrderSummary from "./CheckoutOrderSummary";

const SecondStep = ({ onComplete, onBack }) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const paymentMethod = useAppSelector(selectPaymentMethod) || "CASH";
  const cart = useAppSelector(selectCartItems);
  const isAuthenticated = useAppSelector(selectIsAuthenticated) || false;
  const role = useAppSelector(selectUserRole);
  const isGuest = role === "GUEST";
  const guestData = useAppSelector(selectGuestData);
  const selectedAddress = useAppSelector(selectSelectedAddress);
  const { discountAmount } = useAppSelector((state) => state.order);

  // Totals
  const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.count), 0);

  const handlePaymentMethodSelect = (method) => {
    dispatch(setPaymentMethod(method));
  };

  const handleContinue = () => {
    if (!paymentMethod) {
      toast.error("Ödeme yöntemi seçilmedi", { title: "Hata" });
      return;
    }

    if (isGuest) {
      if (!guestData.name || !guestData.surname || !guestData.email || !guestData.phoneNumber) {
        toast.error("Lütfen önceki adımda tüm kişisel bilgilerinizi doldurun.", { title: "Eksik bilgi" });
        if (onBack) onBack();
        return;
      }
    }

    if (!selectedAddress) {
      toast.error("Lütfen önceki adımda bir teslimat adresi belirtin.", { title: "Adres bilgisi eksik" });
        if (onBack) onBack();
      return;
    }

    if (onComplete) onComplete();
    toast.success("Şimdi siparişinizi tamamlayabilirsiniz.", { title: "Ödeme yöntemi seçildi" });
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
            onClick={onBack}
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
        <div className="mb-6">
            <AddressSummary address={selectedAddress} />
          <button
            onClick={onBack}
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
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">
          Ödeme Bilgileri
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Sipariş özetinizi kontrol edin ve bir ödeme yöntemi seçin.
        </p>

        {/* Sipariş Özeti */}
        <CheckoutOrderSummary 
            cart={cart}
            totalAmount={totalAmount}
            discountAmount={discountAmount}
            onEditCart={onBack} // Send back to step 1 (implied cart editing)
        />

        {isGuest && renderUserInfo()}
        {renderAddressInfo()}

        {/* Ödeme Seçenekleri */}
        <PaymentMethodSelector 
            paymentMethod={paymentMethod}
            isGuest={isGuest}
            onSelect={handlePaymentMethodSelect}
        />
      </div>

      <div className="px-6 py-4 bg-gray-50 flex justify-between">
        <button
          type="button"
          onClick={onBack}
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