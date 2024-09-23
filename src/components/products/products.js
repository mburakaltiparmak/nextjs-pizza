/* eslint-disable @next/next/no-img-element */
"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addCart } from "@/lib/store/actions/orderActions";
import { useToast } from "@/hooks/use-toast";
import { fetchProductsById } from "@/lib/store/actions/productActions";
import { useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
const Products = () => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const products = useAppSelector((store) => store.product.products);
  const selectedCategory = useAppSelector(
    (store) => store.product.selectedCategory
  );
  useEffect(() => {
    if (selectedCategory != null) {
      dispatch(fetchProductsById(selectedCategory));
    }
  }, [selectedCategory, dispatch]);

  const handleAddCart = (product) => {
    dispatch(addCart(product));
    toast({
      title: (
        <div className="flex flex-row gap-4 items-center py-4">
          <img
            src={product.product_img}
            alt={product.product_name}
            className="w-[32px] h-fit object-cover"
          />
          <p>{product.product_name} sepete başarıyla eklendi.</p>
        </div>
      ),
    });
  };
  return (
    <div
      id="product-field"
      className="grid grid-cols-3 place-items-center place-content-between  gap-8  max-md:flex max-md:flex-col max-md:py-4 "
    >
      {products.length > 0 ? (
        products.map((item, index) => (
          <label
            htmlFor={item.product_name}
            className="flex flex-col justify-between items-center text-center font-Barlow text-darkgray border border-lightgray shadow-darkgray shadow-md w-[250px] h-[350px] py-4"
            key={index}
          >
            <Popover>
              <PopoverTrigger asChild>
                <span className="cursor-pointer">
                  <img
                    className="object-cover h-[125px]"
                    src={item.product_img}
                    alt={item.product_name}
                  />
                </span>
              </PopoverTrigger>
              <PopoverContent>
                <img
                  className="object-cover h-[250px]"
                  src={item.product_img}
                  alt={item.product_name}
                />
              </PopoverContent>
            </Popover>
            <p className="font-bold text-xl">{item.product_name}</p>
            <span className="flex flex-row justify-between gap-4 text-lg">
              <p>{item.rating}</p>
              <p>({item.stock})</p>
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
