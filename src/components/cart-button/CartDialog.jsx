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
        <AlertDialogContent className="bg-white border-none shadow-2xl rounded-3xl p-0 max-w-md w-[95%] sm:w-full overflow-hidden gap-0">

          {/* Header */}
          <AlertDialogHeader className="bg-white border-b border-lightgray p-6 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="bg-yellow/10 p-2.5 rounded-full">
                <ShoppingCart className="w-6 h-6 text-yellow" />
              </div>
              <AlertDialogTitle className="text-2xl font-Barlow font-bold text-darkgray tracking-tight">
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

          <div className="p-6 bg-white min-h-[300px] flex flex-col">
            {hasItems ? (
              <AlertDialogDescription className="text-gray font-Barlow mb-4 text-sm font-medium">
                Sepetinizde <span className="text-red font-bold">{totalItems}</span> ürün bulunmaktadır.
              </AlertDialogDescription>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center py-8 gap-6 opacity-60">
                <div className="w-24 h-24 bg-lightgray rounded-full flex items-center justify-center">
                  <ShoppingCart size={40} className="text-gray" />
                </div>
                <div className="text-center">
                  <AlertDialogDescription className="text-xl font-bold font-Barlow text-darkgray mb-2">
                    Sepetiniz boş
                  </AlertDialogDescription>
                  <p className="text-sm text-gray font-Barlow max-w-[200px] mx-auto">
                    Lezzetli pizzalarımızdan dilediğinizi hemen ekleyin.
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn-primary"
                >
                  Menüye Git
                </button>
              </div>
            )}

            {/* Cart Items List */}
            {hasItems && (
              <div className="flex-grow overflow-y-auto pr-2 -mr-2 max-h-[40vh] scrollbar-thin scrollbar-thumb-gray scrollbar-track-transparent">
                <div className="space-y-1 pb-2">
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
            <div className="bg-lightgray p-6 space-y-4 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-end">
                <span className="font-medium text-gray font-Barlow text-base mb-1">Toplam Tutar</span>
                <span className="font-bold text-darkgray text-3xl font-Quattrocento_Sans">
                  {totalAmount.toFixed(2)} <span className="text-lg text-gray font-normal">₺</span>
                </span>
              </div>

              <AlertDialogFooter className="flex-col sm:flex-col gap-3 sm:space-x-0">
                <AlertDialogAction
                  onClick={onCheckout}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-6 text-lg"
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