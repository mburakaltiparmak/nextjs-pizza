"use client";
import React from "react";
import { ShoppingCart } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CartItemCard } from "./CartItemCard";

export const CartDialog = ({
  isOpen,
  setIsOpen,
  isClient,
  cart,
  totalItems,
  totalAmount,
  hasItems,
  triggerButtonRef,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}) => {
  return (
    <div className="fixed top-2 right-4 z-50 shadow-sm hover:z-100 hover:shadow-lg hover:scale-105 active:scale-95 rounded-full">
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        {/* Trigger Button */}
        <AlertDialogTrigger asChild>
          <button
            ref={triggerButtonRef}
            className="bg-yellow max-md:text-xs z-10 text-red p-4 max-md:p-2 rounded-full shadow-lg flex items-center justify-center hover:bg-black hover:text-yellow hover:ring-yellow ring-2 ring-inset ring-black transition-colors duration-200"
            aria-label="Sepeti Aç"
          >
            <ShoppingCart size={24} />
            {isClient && totalItems > 0 && (
              <span className="absolute -bottom-1 -right-1 bg-red border-2 border-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-Barlow">
                {totalItems}
              </span>
            )}
          </button>
        </AlertDialogTrigger>

        {/* Dialog Content */}
        <AlertDialogContent className="bg-white font-Barlow max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-darkgray">
              Sepetiniz
            </AlertDialogTitle>
            {hasItems ? (
              <AlertDialogDescription>
                Sepetinizde {totalItems} ürün bulunmaktadır.
              </AlertDialogDescription>
            ) : (
              <AlertDialogDescription>
                Sepetiniz boş.
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>

          {/* Cart Items List */}
          <div className="max-h-64 overflow-y-auto py-2">
            {!hasItems ? (
              <p className="text-center text-gray-500 py-4">
                Sepetinizde ürün bulunmuyor
              </p>
            ) : (
              <div className="space-y-3">
                {cart.map((item, index) => (
                  <CartItemCard
                    key={item.id || index}
                    item={item}
                    onUpdateQuantity={onUpdateQuantity}
                    onRemove={onRemove}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Total Amount */}
          {hasItems && (
            <div className="py-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">Toplam:</span>
                <span className="font-bold text-red text-lg">
                  {totalAmount.toFixed(2)} ₺
                </span>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel
              className="bg-red text-white ring-2 ring-inset ring-black hover:bg-darkred hover:text-white hover:shadow-lg hover:scale-105 active:scale-95"
              onClick={() => setIsOpen(false)}
            >
              Kapat
            </AlertDialogCancel>
            {hasItems && (
              <AlertDialogAction
                onClick={onCheckout}
                className="bg-yellow text-red hover:bg-red hover:text-yellow transition-colors"
              >
                Siparişi Tamamla
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};