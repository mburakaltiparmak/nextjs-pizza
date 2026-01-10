/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { HoverCard, HoverCardTrigger } from "../ui/hover-card";
import Products from "../products/products";
const allLogo = "/assets/adv-aseets/icons/all-logo.png";
import { fetchCategories } from "@/lib/store/actions/categoryActions";
import { fetchProducts } from "@/lib/store/actions/productActions";
import { LoadingSpinner } from "../ui/LoadingSpinner";
const Categories = () => {
  const dispatch = useAppDispatch();

  // Redux state
  const categories = useAppSelector((state) => state.category.categories);
  const products = useAppSelector((state) => state.product.products);
  const globalLoading = useAppSelector((state) => state.global.loading);

  // Local state
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);

  // Kategori seçme işlemi - veri yeniden yükleme
  useEffect(() => {
    if (selectedCategoryId !== null) {
      const loadCategoryData = async () => {
        setContentLoading(true);
        try {
          // Seçili kategoriye göre ürünleri filtrele ve yükle
          // Burada aslında backend'e kategori ID ile filtreleme yapacak API isteği atılabilir
          // await dispatch(fetchProductsByCategory(selectedCategoryId));
          // Şu an için client tarafında filtreliyoruz
          setContentLoading(false);
        } catch (error) {
          console.error("Kategori ürünleri yüklenirken hata:", error);
          setContentLoading(false);
        }
      };

      loadCategoryData();
    }
  }, [dispatch, selectedCategoryId]);

  // Kategori seçme işlemi
  const handleCategory = (id, e) => {
    e.preventDefault();
    setSelectedCategoryId(id);
  };

  // Tüm ürünleri gösterme işlemi
  const handleAllOfThem = (e) => {
    e.preventDefault();
    setSelectedCategoryId(null);
  };

  const isLoading = globalLoading || contentLoading;

  // Veriler yüklenene kadar loading göster
  if (isLoading || !categories || categories.length === 0) {
    return <LoadingSpinner size="small" />;
  }

  return (
    <div
      id="categories"
      className="flex flex-col justify-between items-center gap-8 text-black"
    >
      <div className="flex flex-row justify-center flex-wrap items-center gap-2 mt-4 max-lg:grid max-xl:grid-cols-4 max-md:grid-cols-2 max-md:place-items-center max-md:gap-4">
        <button
          onClick={(e) => handleAllOfThem(e)}
          className={`btn-secondary ${selectedCategoryId === null ? "bg-yellow text-red font-bold" : ""
            }`}
        >
          <img className="h-9 w-fit object-cover" src={allLogo} alt="all" />
          <HoverCard>
            <HoverCardTrigger>Hepsi</HoverCardTrigger>
          </HoverCard>
        </button>

        {categories.map((item) => (
          <button
            key={item.id}
            onClick={(e) => handleCategory(item.id, e)}
            className={`btn-secondary ${selectedCategoryId === item.id
              ? "bg-yellow text-red font-bold"
              : ""
              }`}
          >
            <img
              className="h-9 w-fit object-cover"
              src={item.img}
              alt={item.name}
            />
            <HoverCard>
              <HoverCardTrigger>{item.name}</HoverCardTrigger>
            </HoverCard>
          </button>
        ))}
      </div>

      {/* Seçilen kategoriye göre ürünleri filtrele */}
      <Products
        categoryFilter={selectedCategoryId ? selectedCategoryId.toString() : ""}
      />
    </div>
  );
};

export default Categories;
