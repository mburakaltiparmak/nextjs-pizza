"use client";
import React from "react";
import { useCartButton } from "@/hooks/use-cart-button";
import { CartDialog } from "./CartDialog";

const FloatingCartButton = () => {
  const {
    cart,
    isOpen,
    setIsOpen,
    isClient,
    triggerButtonRef,
    totalItems,
    totalAmount,
    hasItems,
    handleCheckout,
    handleUpdateQuantity,
    handleRemoveItem,
  } = useCartButton();



  return (
    <CartDialog
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      isClient={isClient}
      cart={cart}
      totalItems={totalItems}
      totalAmount={totalAmount}
      hasItems={hasItems}
      triggerButtonRef={triggerButtonRef}
      onUpdateQuantity={handleUpdateQuantity}
      onRemove={handleRemoveItem}
      onCheckout={handleCheckout}
    />
  );
};

export default FloatingCartButton;