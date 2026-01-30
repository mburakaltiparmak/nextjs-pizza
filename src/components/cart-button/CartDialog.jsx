"use client";
import React from "react";
import { ShoppingCart, X } from "lucide-react";
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
import { PromoCodeInput } from "@/components/cart/PromoCodeInput";
import { EmptyState, PriceSummary } from "@/components/common";

export const CartDialog = ({
  isOpen,
  setIsOpen,
  isClient,
  cart,
  totalItems,
  totalAmount,
  discountAmount,
  finalAmount,
  hasItems,
  triggerButtonRef,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}) => {
  return (
    <div className="fixed top-4 right-4 z-[9999]">
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        {/* Trigger Button */}
        <AlertDialogTrigger asChild>
          <button
            ref={triggerButtonRef}
            className="group relative p-3.5 bg-yellow rounded-full text-darkgray flex items-center justify-center shadow-lg hover:bg-darkgray hover:text-yellow transition-all duration-300 ring-2 ring-white hover:scale-105 active:scale-95"
            aria-label="Sepeti Aç"
          >
            <ShoppingCart size={24} />
            {isClient && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red border-2 border-white text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold font-Barlow">
                {totalItems}
              </span>
            )}
          </button>
        </AlertDialogTrigger>

        {/* Dialog Content */}
        <AlertDialogContent className="bg-white border-none shadow-2xl rounded-2xl sm:rounded-3xl p-0 w-[95%] max-w-lg sm:w-full overflow-hidden gap-0">

          {/* Header */}
          <AlertDialogHeader className="bg-white border-b border-lightgray p-5 sm:p-6 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="bg-yellow/10 p-2 sm:p-2.5 rounded-full">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-yellow" />
              </div>
              <AlertDialogTitle className="text-xl sm:text-2xl font-Barlow font-bold text-darkgray tracking-tight">
                Sepetim
              </AlertDialogTitle>
            </div>
            <AlertDialogCancel
              className="w-8 h-8 p-0 bg-transparent text-gray hover:text-darkgray hover:bg-lightgray border-none rounded-full transition-colors flex items-center justify-center mt-0"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </AlertDialogCancel>
          </AlertDialogHeader>

          <div className="p-5 sm:p-6 bg-white min-h-[250px] sm:min-h-[300px] flex flex-col">
            {hasItems ? (
              <AlertDialogDescription className="text-gray font-Barlow mb-4 text-sm font-medium">
                Sepetinizde <span className="text-red font-bold">{totalItems}</span> ürün bulunmaktadır.
              </AlertDialogDescription>
            ) : (
                <EmptyState
                    icon={ShoppingCart}
                    title="Sepetiniz boş"
                    description="Lezzetli pizzalarımızdan dilediğinizi hemen ekleyin."
                    actionLabel="Menüye Git"
                    onAction={() => setIsOpen(false)}
                />
            )}

            {/* Cart Items List */}
            {hasItems && (
              <div className="flex-grow overflow-y-auto pr-2 -mr-2 max-h-[50vh] sm:max-h-[45vh] scrollbar-thin scrollbar-thumb-gray scrollbar-track-transparent">
                <div className="space-y-3 pb-2">
                  {cart.map((item, index) => (
                    <CartItemCard
                      key={item.id || index}
                      item={item}
                      onUpdateQuantity={onUpdateQuantity}
                      onRemove={onRemove}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer - Total & Checkout */}
          {hasItems && (
            <div className="bg-lightgray p-5 sm:p-6 space-y-4 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
              <div className="space-y-3">
                {/* Promo Code Input */}
                <PromoCodeInput />

                {/* Price Breakdown */}
                <PriceSummary 
                    subtotal={totalAmount}
                    discountAmount={discountAmount}
                    totalAmount={finalAmount !== undefined ? finalAmount : totalAmount}
                />
              </div>

              <AlertDialogFooter className="flex-col sm:flex-col gap-3 sm:space-x-0">
                <AlertDialogAction
                  onClick={onCheckout}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-4 sm:py-6 text-base sm:text-lg"
                >
                  Siparişi Tamamla
                </AlertDialogAction>
              </AlertDialogFooter>
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};