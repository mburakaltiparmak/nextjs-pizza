/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import {
  removeFromCart,
  updateCart,
  clearCart,
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
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const router = useRouter();
  const cart = useAppSelector((store) => store.order.cart);

 
  const [localCart, setLocalCart] = useState(cart);
  console.log("cart : ",localCart);

  useEffect(() => {
    setLocalCart(cart);
  }, [cart]);

  const handleDecrementCount = (item) => {
    if (item.count <= 1) {
      dispatch(removeFromCart(item.product.product_id));
      toast({
        title: "Ürün sepetten kaldırıldı.",
      });
    } else {
      dispatch(updateCart(item.product.product_id, item.count - 1));
      toast({
        title: "Ürün miktarı güncellendi",
      });
    }
  };

  const handleIncrementCount = (item) => {
    dispatch(updateCart(item.product.product_id, item.count + 1));
    toast({
      title: "Ürün miktarı güncellendi",
    });
  };

  const handleRemoveFromCart = (item) => {
    dispatch(removeFromCart(item.product.product_id));
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

  return (
    <div className="fixed top-4 right-4 z-50">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <div className="bg-yellow text-red p-3 rounded-full shadow-lg hover:bg-darkred hover:border-2 hover:border-lightgray transition-colors duration-200 cursor-pointer max-md:w-auto w-full flex justify-center items-center">
            <FontAwesomeIcon icon={faShoppingCart} />
            <span className="ml-2">
              {localCart.reduce((sum, item) => sum + item.count, 0)}
            </span>
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-3xl w-full max-md:fixed max-md:bottom-0 max-md:top-1/3  max-md:max-h-screen  max-md:rounded-none max-md:flex max-md:flex-col">
          <AlertDialogHeader>
            <AlertDialogTitle>Sepetiniz</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block max-h-[60vh] max-md:max-h-screen overflow-y-auto">
                {localCart.length === 0 ? (
                  <span>Sepetiniz boş.</span>
                ) : (
                  <span className="block space-y-4">
                    {localCart.map((item) => (
                      <span
                        key={item.product.product_id}
                        className="flex flex-col justify-between items-start gap-4  max-md:gap-2 border-b pb-2"
                      >
                        <span className="flex flex-row justify-between items-center gap-4 max-md:gap-2 w-full max-md:w-auto">
                          <img
                            src={item?.product?.product_img}
                            alt={item.product.product_name}
                            className="w-16 h-16 object-cover max-md:w-12 max-md:h-12"
                          />
                          <span className="flex flex-col justify-between items-start  gap-2 flex-grow">
                            <span className="font-bold">
                              {item.product.product_name}
                            </span>
                            <span>{item.product.price} ₺</span>
                          </span>
                        </span>
                        <span className="flex flex-row justify-between items-center gap-4 max-md:gap-2 w-full max-md:w-auto">
                          <span className="flex flex-row items-center border border-blue-950 rounded-md bg-blue-950 text-lightgray">
                            <span
                              onClick={() => handleDecrementCount(item)}
                              className="w-[32px] h-[32px] max-md:w-[24px] max-md:h-[24px] bg-blue-950 border-blue-950 rounded-md hover:bg-lightgray hover:text-blue-950 flex items-center justify-center cursor-pointer"
                            >
                              <span>-</span>
                            </span>
                            <span className="mx-3">{item.count}</span>
                            <span
                              onClick={() => handleIncrementCount(item)}
                              className="w-[32px] h-[32px] max-md:w-[24px] max-md:h-[24px] bg-blue-950 border-blue-950 rounded-md hover:bg-lightgray hover:text-blue-950 flex items-center justify-center cursor-pointer"
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
                <span className="font-bold">
                  Toplam:{" "}
                  {localCart.reduce(
                    (sum, item) => sum + item.product.price * item.count,
                    0
                  )}{" "}
                  ₺
                </span>
                <Button
                  onClick={handleClearCart}
                  className="bg-red text-white px-4 py-2 border border-transparent rounded hover:bg-lightgray hover:text-red hover:border-red transition-colors duration-200 w-full max-md:w-auto"
                >
                  <span>Sepeti Temizle</span>
                </Button>
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col max-md:flex-row items-center max-md:justify-between gap-2 max-md:gap-0">
            <AlertDialogCancel className="border-2 border-primary bg-primary text-lightgray hover:bg-secondary hover:text-primary w-full max-md:w-auto">
              Kapat
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <span
                className="rounded-md border-2 border-transparent bg-blue-950 text-lightgray hover:bg-lightgray hover:text-blue-950 hover:border-blue-950 cursor-pointer w-full max-md:w-auto text-center"
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
