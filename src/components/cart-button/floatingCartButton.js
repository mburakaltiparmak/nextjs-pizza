"use client";
import React from "react";
import { useCartButton } from "@/lib/hooks/useCartButton";
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
    discountAmount,
    finalAmount,
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
      discountAmount={discountAmount}
      finalAmount={finalAmount}
      hasItems={hasItems}
      triggerButtonRef={triggerButtonRef}
      onUpdateQuantity={handleUpdateQuantity}
      onRemove={handleRemoveItem}
      onCheckout={handleCheckout}
    />
  );
};

export default FloatingCartButton;