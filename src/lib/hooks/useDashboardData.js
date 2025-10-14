"use client";

import { useState, useCallback } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { fetchDashboard } from "@/lib/store/actions/adminActions";
import { fetchCategories } from "@/lib/store/actions/categoryActions";
import { fetchAllUsers } from "@/lib/store/actions/adminActions";
import { setModuleLoading } from "@/lib/store/actions/globalActions";
import { handleApiError } from "@/lib/store/middleware/errorMiddleware";

export const useDashboardData = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    dispatch(setModuleLoading('admin', true));
    dispatch(setModuleLoading('category', true));
    dispatch(setModuleLoading('user', true));

    try {
      try {
        await dispatch(fetchDashboard());
        return { success: true };
      } catch (dashboardError) {
        console.warn("Dashboard API failed, falling back to individual calls");
      }

      const results = await Promise.allSettled([
        dispatch(fetchCategories()),
        dispatch(fetchAllUsers()),
      ]);

      const failures = results.filter((r) => r.status === "rejected");
      
      if (failures.length > 0) {
        console.warn("Some dashboard data requests failed:", failures);
        
        if (failures.length < results.length) {
          setError("Bazı veriler yüklenemedi");
          return { partial: true };
        } else {
          throw new Error("Tüm veri istekleri başarısız");
        }
      }

      return { success: true };
    } catch (err) {
      console.error("Dashboard data loading error:", err);

      const isNetworkError =
        err.message === "Network Error" ||
        err.name === "NetworkError" ||
        !navigator.onLine;

      if (isNetworkError && retryCount < MAX_RETRIES) {
        const nextRetry = retryCount + 1;
        setRetryCount(nextRetry);

        const backoffTime = Math.min(Math.pow(2, retryCount) * 1000, 5000);
        
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
        return loadDashboardData();
      }

      const errorResult = handleApiError(err, dispatch, 'loadDashboardData');
      setError(errorResult.error);
      return { error: errorResult.error };
    } finally {
      setLoading(false);
      dispatch(setModuleLoading('admin', false));
      dispatch(setModuleLoading('category', false));
      dispatch(setModuleLoading('user', false));
    }
  }, [dispatch, retryCount]);

  const retry = useCallback(() => {
    setRetryCount(0);
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    loading,
    error,
    loadDashboardData,
    retry,
    retryCount,
  };
};