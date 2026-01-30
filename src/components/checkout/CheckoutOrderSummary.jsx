"use client";
import React from "react";
import { PromoCodeInput } from "@/components/cart/PromoCodeInput";
import { PriceSummary } from "@/components/common";

const CheckoutOrderSummary = ({ cart, totalAmount, discountAmount, onEditCart }) => {
  if (!cart || cart.length === 0) return null;

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

      {/* Promo Code Input */}
      <div className="border-t pt-3 mb-3">
        <PromoCodeInput />
      </div>

      {/* Özet bilgiler */}
      <div className="mt-3">
        <PriceSummary
          subtotal={totalAmount}
          discountAmount={discountAmount}
          totalAmount={Math.max(0, totalAmount - (discountAmount || 0))}
        />
      </div>

      <button
        onClick={onEditCart}
        className="mt-3 text-xs text-red underline"
      >
        Sepeti Düzenle
      </button>
    </div>
  );
};

export default CheckoutOrderSummary;
