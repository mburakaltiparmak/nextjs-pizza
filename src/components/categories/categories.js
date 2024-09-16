/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchProductsById, setSelectedCategory } from "@/lib/store/actions/productActions";
import { HoverCard, HoverCardTrigger } from "../ui/hover-card";
import useSWR from "swr";
import Products from "../products/products";
import NotFound from "@/app/not-found";
import Loading from "@/app/loading";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

const Categories = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((store) => store.product.categories);
  
  const handleCategory = (id) => {
    dispatch(setSelectedCategory(id));
   // dispatch(fetchProductsById(id));
  };
  
  
/*
  const { data: firstApiData, error: firstApiError } = useSWR(
    "https://66c0ce8bba6f27ca9a57a405.mockapi.io/api/products",
    fetcher
  );

  const { data: secondApiData, error: secondApiError } = useSWR(
    selectedCategory
      ? `https://66c0ce8bba6f27ca9a57a405.mockapi.io/api/products/${selectedCategory}`
      : null,
    fetcher
  );
*/
  const [data, setData] = useState([]);
/*
  useEffect(() => {
    if (selectedCategory && secondApiData) {
      setData(secondApiData);
      console.log("data by category : ", secondApiData);
    } else if (!selectedCategory && firstApiData) {
      setData(firstApiData);
      console.log("full data : ", firstApiData);
    }
  }, [firstApiData, secondApiData, selectedCategory]);

  const handleCategory = (id) => {
    dispatch(setSelectedCategory(id));
  };

  if (firstApiError || secondApiError) {
    return <NotFound />;
  }

  if (!firstApiData) {
    return <Loading />;
  }
*/
  return (
    <div
      id="categories"
      className="flex flex-col justify-between items-center gap-8 "
    >
      <div className="grid grid-cols-6 grid-flow-row mt-4 w-[150vh]">
        {categories.length > 0 ? (
          categories.map((item, index) => (
            <button
              key={index}
              onClick={() => handleCategory(item.category_id)}
              className="optionStyle rounded-full text-sm py-1"
            >
              <img
                className="w-[50px] h-fit object-cover"
                src={item.category_img}
                alt={item.category_name}
              />
              <HoverCard>
                <HoverCardTrigger>{item.category_name}</HoverCardTrigger>
              </HoverCard>
            </button>
          ))
        ) : (
          <p>Kategori bulunamadı.</p>
        )}
      </div>
      {
      
      
      <Products />
      
      
      }
    </div>
  );
};

export default Categories;
