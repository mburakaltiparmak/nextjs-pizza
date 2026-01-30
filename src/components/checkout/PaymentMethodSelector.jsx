"use client";
import React from "react";
import { CreditCard, Banknote, GiftIcon } from "lucide-react";

const PaymentMethodSelector = ({ paymentMethod, isGuest, onSelect }) => {
  
  const handleSelect = (method) => {
    onSelect(method);
  };

  const getButtonClass = (method) => {
    return `flex items-center border p-3 rounded-md transition-all ${
      paymentMethod === method
        ? "border-yellow bg-darkred text-yellow"
        : "border-gray-300 hover:border-gray-400 bg-white"
    }`;
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Ödeme Yöntemi</h3>
      <div className="grid gap-3">
        <button
          type="button"
          className={getButtonClass("ONLINE_CREDIT_CARD")}
          onClick={() => handleSelect("ONLINE_CREDIT_CARD")}
        >
          <CreditCard className="mr-3" size={20} />
          <span>Online Kredi Kartı</span>
        </button>

        <button
          type="button"
          className={getButtonClass("CREDIT_CARD")}
          onClick={() => handleSelect("CREDIT_CARD")}
        >
          <CreditCard className="mr-3" size={20} />
          <span>Kapıda Kredi Kartı</span>
        </button>

        <button
          type="button"
          className={getButtonClass("CASH")}
          onClick={() => handleSelect("CASH")}
        >
          <Banknote className="mr-3" size={20} />
          <span>Kapıda Nakit Ödeme</span>
        </button>

        {!isGuest && (
          <button
            type="button"
            className={getButtonClass("GIFT_CARD")}
            onClick={() => handleSelect("GIFT_CARD")}
          >
            <GiftIcon className="mr-3" size={20} />
            <span>Yemek Kartı</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
