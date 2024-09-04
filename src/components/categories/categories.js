/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setSelectedCategory } from "@/lib/store/actions/productActions";
import { HoverCard, HoverCardTrigger } from "../ui/hover-card";
import useSWR from "swr";
import Products from "../products/products";
import NotFound from "@/app/not-found";
import Loading from "@/app/loading";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

const Categories = () => {
  const dispatch = useAppDispatch();
  const selectedCategory = useAppSelector((store) => store.product.selectedCategory);

  // First API call to get the list of categories
  const { data: firstApiData, error: firstApiError } = useSWR(
    "https://66c0ce8bba6f27ca9a57a405.mockapi.io/api/products",
    fetcher
  );

  // Second API call to get products based on the selected category
  const { data: secondApiData, error: secondApiError } = useSWR(
    selectedCategory ? `https://66c0ce8bba6f27ca9a57a405.mockapi.io/api/products/${selectedCategory}` : null,
    fetcher
  );

  const [mappedData, setMappedData] = useState([]);
  console.log("mappedData", mappedData);

  useEffect(() => {
    // When a category is selected, update mappedData only when secondApiData is available
    if (selectedCategory && secondApiData) {
      setMappedData(secondApiData); // Assuming secondApiData contains the products array
    } else if (!selectedCategory && firstApiData) {
      setMappedData(firstApiData); // Show all products when no category is selected
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

  return (
    <div className="flex flex-col justify-between items-center gap-8">
      <div className="flex flex-row justify-center items-center gap-4 mt-4">
        {firstApiData.length > 0 ? (
          firstApiData.map((item, index) => (
            <button
              key={index}
              onClick={() => handleCategory(item.id)}
              className="flex flex-row items-center gap-2 text-darkgray font-semibold text-sm px-4 py-1 border border-transparent rounded-full hover:cursor-pointer hover:text-lightgray hover:bg-darkgray"
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
          <p>No categories available.</p>
        )}
      </div>
      <Products products={mappedData} />
    </div>
  );
};

export default Categories;
