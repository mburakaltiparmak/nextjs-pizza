"use client";
import React, { useState, useEffect } from "react";
import headImg from "../../../assets/adv-aseets/adv-form-banner.png";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import {
  removeFromCart,
  updateCart,
  clearCart,
} from "@/lib/store/actions/orderActions";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

const Page = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const router = useRouter();
  const cart = useAppSelector((store) => store.order.cart);
  const cartArray = Object.values(cart);

  const handleRemoveFromCart = (item) => {
    dispatch(removeFromCart(item.ProductId));
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

  return (
    <div className="flex flex-col items-center gap-2 pb-4">
      <span>
        <Image
          src={headImg.src}
          alt="Pizza"
          className="object-cover"
          width={300}
          height={100}
        />
      </span>
      <Card className="w-[75vh] ">
        <CardHeader className="flex flex-col gap-4">
          <CardTitle>Sipariş Özeti</CardTitle>
          <CardDescription>
            Sipariş özetiniz ektedir. Ödeme yapmak için devam edin.
          </CardDescription>
          <hr />
        </CardHeader>
        {cartArray.length > 0 ? (
          cartArray.map((item, index) => (
            <CardContent className="flex flex-col gap-4" key={index}>
              <div className="grid grid-cols-3 place-items-center">
                <span className="flex flex-row gap-4 items-center w-[200px]">
                  <img
                    src={item.product.product_img}
                    alt={item.product.name}
                    className="w-[96px] h-[96px] object-cover"
                  />
                  <Separator className="h-[96px]" orientation="vertical" />
                </span>
                <span className="flex flex-row items-center justify-start gap-4 w-[200px]">
                  <span className="text-base w-[128px]" htmlFor="name">
                    {item.product.name}
                  </span>
                  <Separator className="h-[96px]" orientation="vertical" />
                </span>
                <span className="flex flex-row gap-4 items-center w-[200px]">
                  <span className="flex flex-row justify-center gap-2 items-center border border-blue-950 rounded-md bg-blue-950  text-lightgray">
                    <Button
                      onClick={() => handleDecrementCount(item)}
                      className="w-[32px] h-[32px] bg-blue-950 border-blue-950 rounded-md hover:bg-lightgray hover:text-blue-950 "
                    >
                      <span>-</span>
                    </Button>
                    <Label className="text-lg" htmlFor="count">
                      {item.count}
                    </Label>
                    <Button
                      onClick={() => handleIncrementCount(item)}
                      className="w-[32px] h-[32px] bg-blue-950 border-blue-950 rounded-md hover:bg-lightgray hover:text-blue-950 "
                    >
                      <span>+</span>
                    </Button>
                  </span>
                  <Separator className="h-[96px]" orientation="vertical" />
                  <Label className="text-lg" htmlFor="price">
                    {item.product.price * item.count} ₺
                  </Label>
                </span>
              </div>
              <hr />
            </CardContent>
          ))
        ) : (
          <p className="space-y-1.5 px-6 pb-4">Sepetinizde ürün yoktur.</p>
        )}

        <CardFooter
          className="flex flex-row justify-between text-lg p-6"
          htmlFor="total"
        >
          <span className="flex flex-row gap-2 text-lg">
            <p className="font-bold">Toplam: </p>
            <p className="text-red">
              {cartArray.reduce(
                (sum, item) => sum + item.product.price * item.count,
                0
              )}{" "}
              ₺
            </p>
          </span>
          <span className="flex flex-row gap-2">
            <Button
              onClick={handleClearCart}
              className="bg-red text-white px-4 py-2 border border-transparent rounded hover:bg-lightgray hover:text-red hover:border-red transition-colors duration-200"
            >
              <span>Sepeti Temizle</span>
            </Button>
            <Button
              className="rounded-md border-2 border-transparent bg-blue-950 text-lightgray hover:bg-lightgray hover:text-blue-950 hover:border-blue-950"
              onClick={() => router.push("/create-order")}
            >
              <span>Siparişi Tamamla</span>
            </Button>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Page;
