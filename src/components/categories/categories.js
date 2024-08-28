"use client";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchProducts,
  setSelectedCategory,
  fetchProductsById,
} from "@/lib/store/actions/productActions";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { useRouter } from "next/navigation";
import Products from "../products/products";

const Categories = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [mappedData, setMappedData] = useState([]);
  const [selectedCategoryProducts, setSelectedCategoryProducts] =
    useState(null);
  const categoryId = useAppSelector((store) => store.product.selectedCategory);
  const products = useAppSelector((store) => store.product.products);
  const itemsByCategory = useAppSelector(
    (store) => store.product.itemsByCategory
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!categoryId) {
        await dispatch(fetchProducts());
      }
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(products)) {
      setMappedData(products);
    } else {
      setMappedData([]);
    }

    if (categoryId) {
      setSelectedCategoryProducts(itemsByCategory);
    }
  }, [products, categoryId, itemsByCategory]);

  const handleCategory = async (id) => {
    dispatch(setSelectedCategory(id));
    try {
      const result = await dispatch(fetchProductsById(id));

      if (result.payload) {
        setSelectedCategoryProducts(result.payload);
      }
    } catch (error) {
      console.error("Error fetching products by category:", error);
    }
    // router.refresh();
  };

  return (
    <div>
      <div className="flex flex-row justify-center items-center gap-4 mt-4">
        {mappedData.map((item, index) => (
          <button
            key={index}
            onClick={() => handleCategory(item.id)}
            className="flex flex-row items-center gap-2 text-darkgray font-semibold text-sm px-4 py-1 border border-transparent rounded-full hover:cursor-pointer hover:text-lightgray hover:bg-darkgray"
          >
            <img
              src={item.category_img}
              width={50}
              height={50}
              alt={item.category_name}
            />
            <HoverCard>
              <HoverCardTrigger>{item.category_name}</HoverCardTrigger>
            </HoverCard>
          </button>
        ))}
      </div>
      <Products selectedCategoryProducts={selectedCategoryProducts} />
    </div>
  );
};

export default Categories;
