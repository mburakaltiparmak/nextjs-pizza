/* eslint-disable @next/next/no-img-element */
"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addCart } from "@/lib/store/actions/orderActions";
import { useEffect, useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "react-toastify";
import RatingStars from "../admin/ratingStars";

const Products = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.categoryAPI.categories);
  const selectedCategory = useAppSelector(
    (state) => state.categoryAPI.selectedCategory
  );
  
  // Seçilen kategorinin ürünlerini kategoriler dizisinden bulma
  const products = useMemo(() => {
    if (!selectedCategory) {
      // Kategori seçilmediğinde tüm ürünleri göster
      return categories.flatMap(category => category.products || []);
    }
    
    const category = categories.find(cat => cat.id === selectedCategory);
    return category?.products || [];
  }, [categories, selectedCategory]);

  const handleAddCart = (product) => {
    dispatch(addCart(product));
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
  
  return (
    <div
      id="product-field"
      className="grid grid-cols-3 place-items-center place-content-between gap-8 max-md:flex max-md:flex-col max-md:py-4"
    >
      {products.length > 0 ? (
        products.map((item, index) => (
          <label
            htmlFor={item.name}
            className="flex flex-col justify-between items-center text-center font-Barlow text-darkgray border border-lightgray shadow-darkgray shadow-md w-[250px] h-[350px] py-4"
            key={index}
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
            <p className="font-bold text-xl">{item.name}</p>
            <span className="flex flex-col justify-between gap-4 text-lg">
              <RatingStars rating={item.rating} />
              
              <p className="font-semibold">{item.price} ₺</p>
            </span>
            <button
              onClick={() => handleAddCart(item)}
              className="buttonStyle bg-yellow text-darkgray hover:bg-red hover:text-lightgray hover:border-yellow hover:border-2"
            >
              SEPETE EKLE
            </button>
          </label>
        ))
      ) : (
        <p className="text-black text-xl">Ürün bulunamadı.</p>
      )}
    </div>
  );
};

export default Products;