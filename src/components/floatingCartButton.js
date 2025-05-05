"use client";
import React, { useEffect, useState, useRef } from "react";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import {
  removeFromCart,
  updateCartItem,
} from "@/lib/store/actions/orderActions";
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
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Özel event ismi - useToast componenti ile aynı olmalı
const OPEN_CART_EVENT = "open_floating_cart";

const FloatingCartButton = () => {
  const cart = useAppSelector((state) => state.order.cart);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const triggerButtonRef = useRef(null);

  console.log("cart", cart);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add event listener for resize
    window.addEventListener("resize", checkMobile);

    // Custom event için listener ekle - Toast'tan açılması için
    const handleOpenCartEvent = () => {
      setIsOpen(true);
      // Trigger button'a otomatik tıklama yaparak AlertDialog'u açacak
      if (triggerButtonRef.current) {
        triggerButtonRef.current.click();
      }
    };

    window.addEventListener(OPEN_CART_EVENT, handleOpenCartEvent);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener(OPEN_CART_EVENT, handleOpenCartEvent);
    };
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.count, 0);
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.price * item.count,
    0
  );

  const handleCheckout = () => {
    router.push("/create-order");
  };

  const handleUpdateQuantity = (itemId, currentCount, operation) => {
    if (operation === "increase") {
      dispatch(updateCartItem(itemId, currentCount + 1));
    } else if (operation === "decrease" && currentCount > 1) {
      dispatch(updateCartItem(itemId, currentCount - 1));
    }
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  return (
    <div className="fixed top-2 right-4 z-50 shadow-sm hover:z-100 hover:shadow-lg hover:scale-105 active:scale-95 rounded-full">
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <button
            ref={triggerButtonRef}
            className="bg-yellow max-md:text-xs z-10 text-red p-4 max-md:p-2 rounded-full shadow-lg flex items-center justify-center hover:bg-black hover:text-yellow hover:ring-yellow ring-2 ring-inset ring-black transition-colors duration-200 "
          >
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute -bottom-1 -right-1 bg-red border-2 border-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-Barlow">
                {totalItems}
              </span>
            )}
          </button>
        </AlertDialogTrigger>

        <AlertDialogContent className="bg-white font-Barlow">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-darkgray">
              Sepetiniz
            </AlertDialogTitle>
            {cart.length > 0 ? (
              <AlertDialogDescription>
                Sepetinizde {totalItems} ürün bulunmaktadır.
              </AlertDialogDescription>
            ) : (
              <AlertDialogDescription>Sepetiniz boş.</AlertDialogDescription>
            )}
          </AlertDialogHeader>

          {/* Cart Items */}
          <div className="max-h-64 overflow-y-auto py-2">
            {cart.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                Sepetinizde ürün bulunmuyor
              </p>
            ) : (
              <div className="space-y-3">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-gray-100 pb-2"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                        <img
                          src={item.product.img}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {item.product.name}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.id,
                                item.count,
                                "decrease"
                              )
                            }
                            className="text-gray-500 hover:text-red disabled:text-gray-300"
                            disabled={item.count <= 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="text-sm">{item.count}</span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.id,
                                item.count,
                                "increase"
                              )
                            }
                            className="text-gray-500 hover:text-red"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <p className="font-medium text-gray-800">
                        {(item.product.price * item.count).toFixed(2)} ₺
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-gray-500 hover:text-red"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total Amount */}
          {cart.length > 0 && (
            <div className="py-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">Toplam:</span>
                <span className="font-bold text-red">
                  {totalAmount.toFixed(2)} ₺
                </span>
              </div>
            </div>
          )}

          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel
              className="bg-red text-white ring-2 ring-inset ring-black hover:bg-darkred hover:text-white hover:shadow-lg hover:scale-105 active:scale-95"
              onClick={() => setIsOpen(false)}
            >
              Kapat
            </AlertDialogCancel>
            {cart.length > 0 && (
              <AlertDialogAction
                onClick={handleCheckout}
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

export default FloatingCartButton;
