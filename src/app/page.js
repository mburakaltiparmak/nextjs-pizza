"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { homeCards } from "./data";
import Categories from "@/components/categories/categories";
import GoToMenu from "@/components/goToMenu";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import Loading from "./loading";
import { toast } from "react-toastify";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { fetchCategoryById } from "@/lib/store/actions/categoryActions";
import { fetchProducts } from "@/lib/store/actions/productActions";
import { fetchCategories } from "@/lib/store/actions/categoryActions";
import { checkAuthStatus } from "@/lib/store/actions/userActions";

// New data loading service
const useDataLoader = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Function to load data with retry logic
  const loadData = async (selectedCategory = null) => {
    setLoading(true);
    setError(null);

    try {
      // Handle auth separately - don't block on auth
      dispatch(checkAuthStatus()).catch((err) => {
        console.warn("Auth check failed, continuing anyway:", err);
      });

      // Load product/category data based on selection
      if (selectedCategory) {
        await dispatch(fetchCategoryById(selectedCategory));
      } else {
        // Load both categories and products in parallel
        const results = await Promise.allSettled([
          dispatch(fetchCategories()),
          dispatch(fetchProducts()),
        ]);

        // Check for partial failures
        const failures = results.filter((r) => r.status === "rejected");
        if (failures.length > 0) {
          console.warn("Some data requests failed:", failures);
          if (failures.length < results.length) {
            // Some succeeded, show warning
            toast.warning(
              "Some content couldn't be loaded. You may see partial data."
            );
          } else {
            // All failed, throw error to trigger retry
            throw new Error("All data requests failed");
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Data loading error:", error);

      // Determine if we should retry
      const isNetworkError =
        error.message === "Network Error" ||
        error.name === "NetworkError" ||
        !navigator.onLine;

      if (isNetworkError && retryCount < MAX_RETRIES) {
        const nextRetry = retryCount + 1;
        setRetryCount(nextRetry);

        // Exponential backoff
        const backoffTime = Math.pow(2, retryCount) * 1000;
        console.log(
          `Retrying data load in ${
            backoffTime / 1000
          }s (${nextRetry}/${MAX_RETRIES})`
        );

        // Wait and retry
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
        return loadData(selectedCategory);
      }

      // Max retries or non-network error
      setError(error);
      toast.error("Failed to load data. Please refresh the page.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    loadData,
    retryCount,
  };
};

const Page = () => {
  const dispatch = useAppDispatch();

  // Redux state
  const selectedCategory = useAppSelector(
    (store) => store.product.selectedCategory
  );
  const globalLoading = useAppSelector((store) => store.global.loading);
  const products = useAppSelector((store) => store.product.products);
  const categories = useAppSelector((store) => store.category.categories);

  // Use our custom data loader
  const { loading: dataLoading, loadData } = useDataLoader();
  const [dataInitialized, setDataInitialized] = useState(false);

  // Data status indicators
  const hasProductData = Array.isArray(products) && products.length > 0;
  const hasCategoryData = Array.isArray(categories) && categories.length > 0;
  const shouldShowWarning = !hasProductData || !hasCategoryData;

  // Initialize data on component mount
  useEffect(() => {
    if (!dataInitialized) {
      setDataInitialized(true);
      loadData(selectedCategory);
    }
  }, [dataInitialized, loadData, selectedCategory]);

  // Handle category changes after initial load
  useEffect(() => {
    if (dataInitialized && selectedCategory) {
      loadData(selectedCategory);
    }
  }, [selectedCategory, dataInitialized, loadData]);

  const buttonNotifyHandler = () => {
    toast.info("You can customize this button!");
  };

  // Show loading during initialization or global loading
  if (dataLoading || globalLoading) {
    return <Loading />;
  }

  return (
    <div>
      <Header />
      {/* Show warning if data didn't load properly */}
      {shouldShowWarning && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>Please refresh the page or check your connection.</p>
          <button
            onClick={() => loadData(selectedCategory)}
            className="mt-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-sm"
          >
            Try Again
          </button>
        </div>
      )}
      <div className="flex flex-col justify-between items-center gap-2 text-lightgray">
        <div className="bg-[url('../../assets/mvp-banner.png')] bg-cover bg-center h-screen w-full max-md:h-96">
          <div className="flex flex-col justify-start items-center gap-4 mt-4">
            <span className="flex flex-col justify-between items-center gap-4 text-center">
              <h4 className="font-Satisfy text-yellow text-2xl">
                fırsatı kaçırma
              </h4>
              <h2 className="font-Barlow text-4xl tracking-tighter text-lightgray">
                KOD ACIKTIRIR, <br /> PİZZA DOYURUR
              </h2>

              <Link href="/order">
                <button className="btn-primary">ACIKTIM</button>
              </Link>
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-row justify-center gap-4 mt-4 max-md:flex-col max-md:items-center max-md:mt-0 max-md:gap-2 w-full">
            <div
              className="flex flex-col justify-start items-start text-center text-lightgray p-2 rounded-md max-md:p-0 w-full max-md:w-80 bg-cover bg-center"
              style={{
                backgroundImage: `url(${homeCards[0].background.src})`,
              }}
            >
              <span className="m-4 flex flex-col items-start gap-4">
                <p className="text-5xl font-bold font-Quattrocento w-1/2 text-left">
                  {homeCards[0].text}
                </p>
                <button onClick={buttonNotifyHandler} className="btn-primary">
                  {homeCards[0].buttonText}
                </button>
              </span>
            </div>
            <span className="flex flex-col gap-4 max-md:gap-2 max-md:items-center">
              <div
                className="flex flex-col justify-start items-start text-center text-lightgray p-2 rounded-md max-md:p-0 bg-cover bg-center h-full w-80"
                style={{
                  backgroundImage: `url(${homeCards[1].background.src})`,
                }}
              >
                <span className="m-4 flex flex-col items-start gap-4">
                  <p className="text-xl font-bold font-Barlow w-3/4 text-left">
                    {homeCards[1].text}
                  </p>
                  <button onClick={buttonNotifyHandler} className="btn-third">
                    {homeCards[1].buttonText}
                  </button>
                </span>
              </div>
              <div
                className="flex flex-col justify-start items-start text-center text-lightgray p-2 rounded-md max-md:p-0 bg-cover bg-center h-full w-80 "
                style={{
                  backgroundImage: `url(${homeCards[2].background.src})`,
                }}
              >
                <span className="m-4 flex flex-col items-start gap-4">
                  <p className="text-xl text-darkgray font-bold font-Barlow w-3/5 text-left">
                    {homeCards[2].text}
                  </p>
                  <button onClick={buttonNotifyHandler} className="btn-fourth">
                    {homeCards[2].buttonText}
                  </button>
                </span>
              </div>
            </span>
          </div>
          <div className="flex flex-col items-center gap-8 my-16 max-md:my-0 max-md:px-8">
            <span className="flex flex-col items-center gap-4 max-md:text-center">
              <h3 className="font-Satisfy font-normal text-3xl text-red">
                en çok paketlenen menüler
              </h3>
              <h4 className="text-darkgray font-semibold text-4xl font-Barlow">
                Acıktıran Kodlara Doyuran Lezzetler
              </h4>
            </span>

            <Categories />
          </div>
        </div>
        <GoToMenu />
      </div>
      <Footer />
    </div>
  );
};

export default Page;
