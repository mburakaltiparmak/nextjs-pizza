/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

import { HoverCard, HoverCardTrigger } from "../ui/hover-card";
import Products from "../products/products";
import NotFound from "@/app/not-found";
import Loading from "@/app/loading";
import allLogo from "../../../assets/adv-aseets/icons/all-logo.png";
import { fetchCategoriesWithProducts, setSelectedCategory } from "@/lib/store/actions/categoryActions";

const Categories = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state)=>state.categoryAPI.categories);

  useEffect(()=>{
    if (!categories || categories.length === 0) {
      dispatch(fetchCategoriesWithProducts());
    }
  },[dispatch, categories?.length])

  const handleCategory = (id,e) => {
    e.preventDefault();
    dispatch(setSelectedCategory(id));
  };
  const handleAllOfThem = (e) => {
    e.preventDefault();
    dispatch(setSelectedCategory(null));
  }

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
      <div className="grid grid-cols-8 grid-flow-row mt-4 max-md:grid-cols-2 max-md:place-items-center max-md:gap-4">
      <button
              
              onClick={(e) => handleAllOfThem(e)}
              className="optionStyle rounded-full text-sm p-2"
            >
              <img
                className="w-[50px] h-fit object-cover"
               src={allLogo.src}
               alt="all"
              />
              <HoverCard>
                <HoverCardTrigger>All</HoverCardTrigger>
              </HoverCard>
            </button>
        { 
        categories?.length > 0 ? (
          categories.map((item, index) => (
            <button
              key={index}
              onClick={(e) => handleCategory(item.id,e)}
              className="optionStyle rounded-full text-sm p-2"
            >
              <img
                className="w-[50px] h-fit object-cover"
                src={item.img}
                alt={item.name}
              />
              <HoverCard>
                <HoverCardTrigger>{item.name}</HoverCardTrigger>
              </HoverCard>
            </button>
          ))
        ) : (
          <p>Kategori bulunamadı.</p>
        )}
      </div>
      {<Products />}
    </div>
  );
};

export default Categories;