/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  removeFromCart,
  clearCart,
  updateCartItemAction,
} from "@/lib/store/actions/orderActions";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

const FloatingCartButton = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const router = useRouter();
  const cart = useSelector((state) => state.order.cart);
  const cartButtonRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [localCart, setLocalCart] = useState(cart);

  // Hesaplanmış değerleri saklayacak ref
  const calculatedRightRef = useRef(null);

  // Buton pozisyonunu hesapla ve sakla
  useEffect(() => {
    // Scrollbar genişliğini hesapla
    const getScrollbarWidth = () => {
      return window.innerWidth - document.documentElement.clientWidth;
    };

    const handleBeforeOpen = () => {
      if (cartButtonRef.current) {
        // Dialog açılmadan önce butonun orijinal konumunu kaydedelim
        calculatedRightRef.current = getScrollbarWidth();

        // Butonun son konumunu ayarlayalım - scrollbar gözönüne alınarak
        cartButtonRef.current.style.right = `16px`;
      }
    };

    const handleAfterOpen = () => {
      if (cartButtonRef.current && calculatedRightRef.current !== null) {
        // Dialog açıldıktan sonra scrollbar kaybolduğunda butonun
        // konumunu aynı yerde tutmak için hesaplanan genişliği uygula
        cartButtonRef.current.style.right = `${
          16 + calculatedRightRef.current
        }px`;
      }
    };

    // Dialog açılıp kapandığında olayları dinle
    const handleOpen = (event) => {
      if (event.target.getAttribute("data-state") === "open") {
        setIsOpen(true);
        handleAfterOpen();
      } else {
        setIsOpen(false);
        handleBeforeOpen();
      }
    };

    // İlk yüklemede pozisyonu hesapla
    handleBeforeOpen();

    // Event dinleyicileri ekle
    document.addEventListener("dialog-state-change", handleOpen);

    return () => {
      document.removeEventListener("dialog-state-change", handleOpen);
    };
  }, []);

  // Dialog state'ini izleyen fonksiyon
  const onOpenChange = (open) => {
    // Dialog açılmadan önce
    if (open && !isOpen) {
      // Özel event fırlatarak butonun konumunu güncelleyelim
      const event = new CustomEvent("dialog-state-change", {
        detail: { state: "opening" },
        bubbles: true,
      });
      cartButtonRef.current.dispatchEvent(event);
    }

    // Dialog kapandıktan sonra
    if (!open && isOpen) {
      // Özel event fırlatarak butonun konumunu güncelleyelim
      const event = new CustomEvent("dialog-state-change", {
        detail: { state: "closed" },
        bubbles: true,
      });
      cartButtonRef.current.dispatchEvent(event);
    }

    setIsOpen(open);
  };

  useEffect(() => {
    setLocalCart(cart);
  }, [cart]);

  const handleDecrementCount = (item) => {
    if (item.quantity <= 1) {
      dispatch(removeFromCart(item.id));
      toast({
        title: "Ürün sepetten kaldırıldı.",
      });
    } else {
      dispatch(updateCartItemAction(item.product.product_id, item.count - 1));
      toast({
        title: "Ürün miktarı güncellendi",
      });
    }
  };

  const handleIncrementCount = (item) => {
    dispatch(updateCartItemAction(item.product.product_id, item.count + 1));
    toast({
      title: "Ürün miktarı güncellendi",
    });
  };

  const handleRemoveFromCart = (item) => {
    dispatch(removeFromCart(item.id));
    toast({
      title: "Ürün sepetten çıkarıldı.",
    });
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    toast({
      title: "Sepet başarıyla temizlendi",
    });
  };

  // Toplam sepet miktarını hesapla
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Toplam sepet tutarını hesapla
  const totalCartPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div
      className="fixed top-14 right-4 z-50 transition-none"
      ref={cartButtonRef}
    >
      <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
        <AlertDialogTrigger asChild>
          <div className="bg-yellow text-red p-3 rounded-full shadow-lg hover:bg-red hover:text-yellow hover:border-2 hover:border-lightgray transition-colors duration-200 cursor-pointer max-md:w-auto font-Quattrocento_Sans flex justify-center items-center">
            <FontAwesomeIcon icon={faShoppingCart} />
            <span className="ml-2">{totalCartItems}</span>
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-3xl w-full max-md:fixed max-md:bottom-0 max-md:top-1/3 max-md:h-fit max-md:rounded-none max-md:flex max-md:flex-col max-md:justify-center border-gray">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-darkgray font-Quattrocento_Sans">
              Sepetiniz
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block max-h-[60vh] overflow-y-auto">
                {cart.length === 0 ? (
                  <span className="font-Barlow text-gray">Sepetiniz boş.</span>
                ) : (
                  <span className="block space-y-4">
                    {cart.map((item) => (
                      <span
                        key={item.id}
                        className="flex flex-col justify-between items-start gap-4 max-md:gap-2 border-b border-lightgray py-4"
                      >
                        <span className="flex flex-row justify-between items-center gap-4 max-md:gap-2 w-full max-md:w-auto">
                          <img
                            src={item.img}
                            alt={item.name}
                            className="w-16 h-16 object-cover max-md:w-12 max-md:h-12"
                          />
                          <span className="flex flex-col justify-between items-start gap-2 flex-grow">
                            <span className="font-bold text-darkgray font-Quattrocento_Sans">
                              {item.name}
                            </span>
                            <span className="text-gray font-Barlow">
                              {item.price} ₺
                            </span>
                          </span>
                        </span>
                        <span className="flex flex-row justify-between items-center gap-4 max-md:gap-2 w-full max-md:w-auto">
                          <span className="flex flex-row items-center border border-red rounded-md bg-red text-lightgray font-Barlow">
                            <span
                              onClick={() => handleDecrementCount(item)}
                              className="w-[32px] h-[32px] max-md:w-[24px] max-md:h-[24px] bg-red border-red rounded-md hover:bg-lightgray hover:text-red flex items-center justify-center cursor-pointer"
                            >
                              <span>-</span>
                            </span>
                            <span className="mx-3">{item.quantity}</span>
                            <span
                              onClick={() => handleIncrementCount(item)}
                              className="w-[32px] h-[32px] max-md:w-[24px] max-md:h-[24px] bg-red border-red rounded-md hover:bg-lightgray hover:text-red flex items-center justify-center cursor-pointer"
                            >
                              <span>+</span>
                            </span>
                          </span>
                          <Button
                            onClick={() => handleRemoveFromCart(item)}
                            className="text-red bg-transparent hover:bg-red hover:text-lightgray"
                          >
                            <span>
                              <FontAwesomeIcon icon={faTrash} />
                            </span>
                          </Button>
                        </span>
                      </span>
                    ))}
                  </span>
                )}
              </span>
              <span className="flex flex-col max-md:flex-row justify-between items-center pt-4 gap-4 max-md:gap-0">
                <span className="font-bold text-darkgray font-Quattrocento_Sans">
                  Toplam: {totalCartPrice.toFixed(2)} ₺
                </span>
                <Button
                  onClick={handleClearCart}
                  className="bg-red text-lightgray px-4 py-2 border border-transparent rounded hover:bg-lightgray hover:text-red hover:border-red transition-colors duration-200 w-full max-md:w-auto font-Barlow"
                >
                  <span>Sepeti Temizle</span>
                </Button>
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col max-md:flex-row items-center max-md:justify-between gap-2 max-md:gap-0">
            <AlertDialogCancel className="border-2 border-darkgray bg-darkgray text-lightgray hover:bg-lightgray hover:text-darkgray w-full max-md:w-auto font-Barlow">
              Kapat
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <span
                className="rounded-md border-2 border-transparent bg-red text-lightgray hover:bg-yellow hover:text-red hover:border-red cursor-pointer w-full max-md:w-auto text-center font-Barlow"
                onClick={() => router.push("/create-order")}
              >
                <span>Siparişi Tamamla</span>
              </span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FloatingCartButton;
