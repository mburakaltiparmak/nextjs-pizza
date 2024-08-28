"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchProducts,
  fetchProductsById,
} from "@/lib/store/actions/productActions";

const Products = () => {
  const dispatch = useAppDispatch();
  const [mappedData, setMappedData] = useState([]);
  const categoryId = useAppSelector((store) => store.product.selectedCategory);
  const allItems = useAppSelector((store) => store.product.products);
  const itemsByCategory = useAppSelector(
    (store) => store.product.itemsByCategory
  );
  const products = useMemo(() => {
    return categoryId ? itemsByCategory : allItems;
  }, [categoryId, itemsByCategory, allItems]);

  useEffect(() => {
    const fetchData = async () => {
      if (categoryId) {
        await dispatch(fetchProductsById(categoryId));
      } else {
        await dispatch(fetchProducts());
      }
    };

    fetchData();
  }, [dispatch, categoryId]);

  useEffect(() => {
    console.log("Fetched Products:", products);
    if (Array.isArray(products)) {
      const mapProd = products.map((item) => item.products);
      setMappedData(mapProd);
      console.log("mapProd", mapProd);
    } else {
      setMappedData([]);
    }
    /*
    if (Array.isArray(products)) {
      // Ensure products is an array
      const mappedData = products.map((item) => item.products);
      setMappedData(mappedData);
      console.log("mapped data:", mappedData);
    } else {
      setMappedData([]); // Reset to empty array if products is not an array
    }
      */
  }, [products]);
  return (
    <div className="flex flex-row flex-wrap justify-between items-center gap-8 mx-24">
      {mappedData.flat().map((item, index) => (
        <label
          htmlFor={item.name}
          className="flex flex-col justify-between items-center text-center font-Barlow text-darkgray border border-lightgray shadow-darkgray shadow-md  w-[275px] h-[350px] py-4"
          key={index}
        >
          <img
            className="object-cover w-[125px] h-fit"
            src={item.product_img}
            alt={item.name}
          />
          <p className="font-bold text-xl">{item.name}</p>
          <span className="flex flex-row justify-between gap-4 text-lg">
            <p>{item.rating}</p>
            <p>({item.stock})</p>
            <p className="font-semibold">{item.price} ₺</p>
          </span>
          <button className="buttonStyle bg-lightgray text-red hover:bg-yellow hover:text-darkgray hover:border-red hover:border-2">
            SİPARİŞ VER
          </button>
        </label>
      ))}
    </div>
  );
};

export default Products;
