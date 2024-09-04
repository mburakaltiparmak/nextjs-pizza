/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import {
  removeFromCart,
  updateCart,
  clearCart,
  addCart,
  setCount,
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
import Link from "next/link";
import { useRouter } from "next/navigation";

const FloatingCartButton = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const router = useRouter();
  const cart = useAppSelector((store) => store.order.cart);
  //const customPizza = useAppSelector((store) => store.order.customPizza);

  const mappedCart = cart.map((item, index) => {
    return {
      Product: index + 1,
      Name: item.product.name,
      Category_ID: item.product.category_id,
      Rating: item.product.rating,
      Stock: item.product.stock,
      Price: item.product.price,
      Count: item.count,
      Img: item.product.product_img,
      ProductId: item.product.product_id,
    };
  });
  const [localCart, setLocalCart] = useState(mappedCart);
  /*
  useEffect(() => {
    if (customPizza.dough) {
      dispatch(addCart({ product: customPizza }));
    }
  }, [customPizza, dispatch]);
  */

  useEffect(() => {
    setLocalCart(cart);
    console.log("localCart :", cart);
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
          <div className="bg-yellow text-red p-3 rounded-full shadow-lg hover:bg-darkred transition-colors duration-200 cursor-pointer">
            <FontAwesomeIcon icon={faShoppingCart} />
            <span className="ml-2">
              {localCart.reduce((sum, item) => sum + item.count, 0)}
            </span>
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Sepetiniz</AlertDialogTitle>
            <AlertDialogDescription>
              {localCart.length === 0 ? (
                <div>Sepetiniz boş.</div>
              ) : (
                <div className="space-y-4">
                  {localCart.map((item) => (
                    <div
                      key={item.product.product_id}
                      className="flex flex-row justify-between items-center gap-8 border-b pb-2"
                    >
                      <span className="flex flex-row justify-between items-center gap-4">
                        <img
                          src={item.product.product_img}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover"
                        />
                        <div className="flex flex-row justify-between items-center gap-4">
                          <span className="font-bold">{item.product.name}</span>
                          <span>{item.product.price} ₺</span>
                        </div>
                      </span>
                      <span className="flex flex-row justify-between items-center gap-4">
                        <div className="flex flex-row items-center">
                          <button
                            onClick={() => handleDecrementCount(item)}
                            className="px-2 py-1 bg-gray-200 rounded"
                          >
                            <span>-</span>
                          </button>
                          <span className="mx-2">{item.count}</span>
                          <button
                            onClick={() => handleIncrementCount(item)}
                            className="px-2 py-1 bg-gray-200 rounded"
                          >
                            <span>+</span>
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(item)}
                          className="text-red"
                        >
                          <span>
                            <FontAwesomeIcon icon={faTrash} />
                          </span>
                        </button>
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4">
                    <span className="font-bold">
                      Toplam:{" "}
                      {localCart.reduce(
                        (sum, item) => sum + item.product.price * item.count,
                        0
                      )}{" "}
                      ₺
                    </span>
                    <button
                      onClick={handleClearCart}
                      className="bg-red text-white px-4 py-2 rounded hover:bg-darkred transition-colors duration-200"
                    >
                      <span>Sepeti Temizle</span>
                    </button>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Kapat</AlertDialogCancel>
            <AlertDialogAction>
              <button onClick={() => router.push("/payment")}>
                <span>Siparişi Tamamla</span>
              </button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FloatingCartButton;
