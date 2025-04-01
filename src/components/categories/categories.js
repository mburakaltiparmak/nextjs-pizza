/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HoverCard, HoverCardTrigger } from "../ui/hover-card";
import Products from "../products/products";
import NotFound from "@/app/not-found";
import Loading from "@/app/loading";
import allLogo from "../../../assets/adv-aseets/icons/all-logo.png";
import { fetchCategories } from "@/lib/store/actions/categoryActions";
import { fetchStates } from "@/lib/store/constants";
import SecondaryLoading from "../secondaryLoading";
import { fetchProducts } from "@/lib/store/actions/productActions";

const Categories = () => {
  const dispatch = useDispatch();

  // Redux state
  const categories = useSelector((state) => state.category.categories);
  const categoryFetchState = useSelector((state) => state.category.fetchState);
  const productFetchState = useSelector((state) => state.product.fetchState);

  // Local state
  const [dataFetchAttempted, setDataFetchAttempted] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // Kategorileri ve ürünleri yükle
  useEffect(() => {
    if ((categoryFetchState === fetchStates.NOT_FETCHED || 
         productFetchState === fetchStates.NOT_FETCHED) && 
        !dataFetchAttempted) {
      setDataFetchAttempted(true);
      
      // İlk önce kategorileri yükle
      dispatch(fetchCategories())
        .then(() => {
          // Sonra ürünleri yükle
          return dispatch(fetchProducts());
        })
        .catch((err) => {
          console.error("Veri yükleme hatası:", err);
        });
    }
  }, [dispatch, categoryFetchState, productFetchState, dataFetchAttempted]);

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

  // Yükleniyor durumu
  const isLoading = categoryFetchState === fetchStates.FETCHING || 
                    productFetchState === fetchStates.FETCHING;

  if (isLoading && (!categories || categories.length === 0)) {
    return <SecondaryLoading size="small" />;
  }

  return (
    <div
      id="categories"
      className="flex flex-col justify-between items-center gap-8"
    >
      {"grid grid-cols-8 grid-flow-row"}
      <div className="flex flex-row items-center gap-2 mt-4 max-md:grid-cols-2 max-md:place-items-center max-md:gap-4">
        <button
          onClick={(e) => handleAllOfThem(e)}
          className={`optionStyle rounded-full text-sm p-2 ${
            selectedCategoryId === null ? "bg-yellow text-red font-bold" : ""
          }`}
        >
          <img
            className="w-[50px] h-fit object-cover"
            src={allLogo.src}
            alt="all"
          />
          <HoverCard>
            <HoverCardTrigger>Hepsi</HoverCardTrigger>
          </HoverCard>
        </button>

        {(
          categories.map((item) => (
            <button
              key={item.id}
              onClick={(e) => handleCategory(item.id, e)}
              className={`optionStyle rounded-full text-sm p-2 ${
                selectedCategoryId === item.id
                  ? "bg-yellow text-red font-bold"
                  : ""
              }`}
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
        )} 
      </div>

      {/* Seçilen kategoriye göre ürünleri filtrele */}
      <Products categoryFilter={selectedCategoryId ? selectedCategoryId.toString() : ""} />
    </div>
  );
};

export default Categories;