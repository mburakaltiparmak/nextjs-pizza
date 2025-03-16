/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HoverCard, HoverCardTrigger } from "../ui/hover-card";
import Products from "../products/products";
import NotFound from "@/app/not-found";
import Loading from "@/app/loading";
import allLogo from "../../../assets/adv-aseets/icons/all-logo.png";
<<<<<<< HEAD
import {
  fetchCategories,
  fetchCategoriesWithProducts,
} from "@/lib/store/actions/categoryActions";
import { fetchStates } from "@/lib/store/constants";
import SecondaryLoading from "../secondaryLoading";
=======
import { fetchCategories, fetchCategoriesWithProducts } from "@/lib/store/actions/categoryActions";
>>>>>>> d150fb8139200ce14344a30aee2634bddc3cb35d

const Categories = () => {
  const dispatch = useDispatch();

  // Redux state
  const categories = useSelector((state) => state.category.categories);
  const categoryFetchState = useSelector((state) => state.category.fetchState);
  const selectedCategory = useSelector(
    (state) => state.product.selectedCategory
  );
  const productFetchState = useSelector((state) => state.product.fetchState);

  // Veri yükleme state'i
  const [dataFetchAttempted, setDataFetchAttempted] = useState(false);

  // Kategorileri yükle
  useEffect(() => {
    if (categoryFetchState === fetchStates.NOT_FETCHED && !dataFetchAttempted) {
      setDataFetchAttempted(true);
      dispatch(fetchCategories()).catch((err) => {
        console.error("Kategori yükleme hatası:", err);
      });
    }
  }, [dispatch, categoryFetchState, dataFetchAttempted]);

  // Kategoriyi seç ve ürünleri filtrele
  const handleCategory = (id, e) => {
    e.preventDefault();
    //dispatch(setSelectedCategory(id));
  };

  // Tüm ürünleri göster
  const handleAllOfThem = (e) => {
    e.preventDefault();
    //dispatch(setSelectedCategory(null));
<<<<<<< HEAD
  };
=======
  }
>>>>>>> d150fb8139200ce14344a30aee2634bddc3cb35d

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
*/
  // Yükleniyor durumu
  if (
    categoryFetchState === fetchStates.FETCHING &&
    (!categories || categories.length === 0)
  ) {
    return <SecondaryLoading size="small" />;
  }

  return (
    <div
      id="categories"
      className="flex flex-col justify-between items-center gap-8"
    >
      <div className="grid grid-cols-8 grid-flow-row mt-4 max-md:grid-cols-2 max-md:place-items-center max-md:gap-4">
        <button
          onClick={(e) => handleAllOfThem(e)}
          className={`optionStyle rounded-full text-sm p-2 ${
            selectedCategory === null ? "bg-yellow text-red font-bold" : ""
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

        {categories && categories.length > 0 ? (
          categories.map((item) => (
            <button
              key={item.id}
              onClick={(e) => handleCategory(item.id, e)}
              className={`optionStyle rounded-full text-sm p-2 ${
                selectedCategory === item.id
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
        ) : (
          <p className="text-gray font-Barlow">Kategori bulunamadı.</p>
        )}
      </div>

      <Products />
    </div>
  );
};

export default Categories;
