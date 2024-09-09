/* eslint-disable @next/next/no-img-element */
"use client";
import { useAppDispatch } from "@/lib/hooks";
import { addCart } from "@/lib/store/actions/orderActions";
import { useToast } from "@/hooks/use-toast";
const Products = ({ products }) => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const flattenedProducts = Array.isArray(products)
    ? products.flatMap((category) => category.products || [])
    : products.products || [];

  if (!Array.isArray(flattenedProducts) || flattenedProducts.length === 0) {
    return <p>No products found</p>;
  }
  const handleAddCart = (product) => {
    dispatch(addCart(product));
    toast({
      title: (
        <div className="flex flex-row gap-4 items-center py-4">
          <img
            src={product.product_img}
            alt={product.name}
            className="w-[32px] h-fit object-cover"
          />
          <p>{product.name} sepete başarıyla eklendi.</p>
        </div>
      ),
    });
  };
  return (
    <div className="grid grid-cols-3 gap-8 w-[150vh] ">
      {flattenedProducts.map((item, index) => (
        <label
          htmlFor={item.name}
          className="flex flex-col justify-between items-center text-center font-Barlow text-darkgray border border-lightgray shadow-darkgray shadow-md w-[250px] h-[350px] py-4"
          key={index}
        >
          <img
            className="object-cover h-[125px]"
            src={item.product_img}
            alt={item.name}
          />
          <p className="font-bold text-xl">{item.name}</p>
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
      ))}
    </div>
  );
};

export default Products;
