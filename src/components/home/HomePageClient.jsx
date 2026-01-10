"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import useAuth from "@/lib/hooks/useAuth";
import Loading from "@/app/loading";
import { useHomeData } from "@/lib/hooks/useHomeData";

export default function HomePageClient({ children }) {
  const { loading: authLoading } = useAuth([], "/", false);
  const { loading: dataLoading, loadHomeData } = useHomeData();
  const [dataInitialized, setDataInitialized] = useState(false);

  const globalLoading = useAppSelector((store) => store.global.loading);
  const products = useAppSelector((store) => store.product.products);
  const categories = useAppSelector((store) => store.category.categories);

  const hasProductData = Array.isArray(products) && products.length > 0;
  const hasCategoryData = Array.isArray(categories) && categories.length > 0;

  useEffect(() => {
    if (!dataInitialized && !hasProductData && !hasCategoryData) {
      setDataInitialized(true);
      loadHomeData();
    }
  }, [dataInitialized, hasProductData, hasCategoryData, loadHomeData]);

  if (authLoading || dataLoading || globalLoading) {
    return <Loading />;
  }

  return <>{children}</>;
}