/* eslint-disable @next/next/no-img-element */
"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {  addToCart } from "@/lib/store/actions/orderActions";
import { useEffect, useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import RatingStars from "../admin/ratingStars";

const Products = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const products = useAppSelector((state)=>state.product.products);

  const handleAddCart = (product) => {
    dispatch(addToCart(product));
    toast.info(
      <div className="flex flex-row gap-4 items-center">
        <img
          src={product.img}
          alt={product.name}
          className="w-[32px] h-fit object-cover"
        />
        <p>{product.name} sepete başarıyla eklendi.</p>
      </div>,
      {
        // Ek ayarlar burada
        position: "top-left", // Bildirimin konumu
        autoClose: 3000, // 3 saniye sonra kapanacak
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      }
    );
  };

  if (!products || products.length === 0) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-gray font-Barlow text-xl">Ürün bulunamadı.</p>
      </div>
    );
  }

  return (
    <div
      id="product-field"
      className="grid grid-cols-3 place-items-center place-content-between gap-8 max-md:flex max-md:flex-col max-md:py-4"
    >
      {filteredProducts && filteredProducts.length > 0 ? (
        filteredProducts.map((item) => (
          <label
            htmlFor={item.name}
            className="flex flex-col justify-between items-center text-center font-Barlow text-darkgray border border-lightgray shadow-darkgray shadow-md w-[250px] h-[350px] py-4"
            key={item.id}
          >
            <Popover>
              <PopoverTrigger asChild>
                <span className="cursor-pointer">
                  <img
                    className="object-cover h-[125px]"
                    src={item.img}
                    alt={item.name}
                  />
                </span>
              </PopoverTrigger>
              <PopoverContent>
                <img
                  className="object-cover h-[250px]"
                  src={item.img}
                  alt={item.name}
                />
              </PopoverContent>
            </Popover>
            <p className="font-bold text-xl font-Quattrocento_Sans">
              {item.name}
            </p>
            <span className="flex flex-col justify-between gap-4 text-lg">
              <RatingStars rating={item.rating} />
              <p className="font-semibold text-darkgray">{item.price} ₺</p>
            </span>
            <button
              onClick={() => handleAddToCart(item)}
              className="buttonStyle bg-yellow text-darkgray hover:bg-red hover:text-lightgray hover:border-yellow hover:border-2 font-Barlow"
            >
              SEPETE EKLE
            </button>
          </label>
        ))
      ) : (
        <p className="col-span-3 text-gray font-Barlow text-xl py-8">
          Seçilen kategoride ürün bulunamadı.
        </p>
      )}
    </div>
  );
};

export default Products;
