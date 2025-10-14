"use client";

import { useState, useCallback } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { fetchCategories } from "@/lib/store/actions/categoryActions";
import { fetchProducts } from "@/lib/store/actions/productActions";
import { setModuleLoading } from "@/lib/store/actions/globalActions";
import { handleApiError } from "@/lib/store/middleware/errorMiddleware";

export const useHomeData = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const loadHomeData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    dispatch(setModuleLoading('category', true));
    dispatch(setModuleLoading('product', true));

    try {
      const results = await Promise.allSettled([
        dispatch(fetchCategories()),
        dispatch(fetchProducts()),
      ]);

      const failures = results.filter((r) => r.status === "rejected");
      
      if (failures.length > 0) {
        console.warn("Some home data requests failed:", failures);
        
        if (failures.length < results.length) {
          setError("Some content couldn't be loaded");
          return { partial: true };
        } else {
          throw new Error("All data requests failed");
        }
      }

      return { success: true };
    } catch (err) {
      console.error("Home data loading error:", err);

      const isNetworkError =
        err.message === "Network Error" ||
        err.name === "NetworkError" ||
        !navigator.onLine;

      if (isNetworkError && retryCount < MAX_RETRIES) {
        const nextRetry = retryCount + 1;
        setRetryCount(nextRetry);

        const backoffTime = Math.pow(2, retryCount) * 1000;
        
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
        return loadHomeData();
      }

      const errorResult = handleApiError(err, dispatch, 'loadHomeData');
      setError(errorResult.error);
      return { error: errorResult.error };
    } finally {
      setLoading(false);
      dispatch(setModuleLoading('category', false));
      dispatch(setModuleLoading('product', false));
    }
  }, [dispatch, retryCount]);

  const retry = useCallback(() => {
    setRetryCount(0);
    loadHomeData();
  }, [loadHomeData]);

  return {
    loading,
    error,
    loadHomeData,
    retry,
    retryCount,
  };
};