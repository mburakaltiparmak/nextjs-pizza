"use client";

import { useState, useCallback } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { fetchDashboard } from "@/lib/store/actions/adminActions";
import { fetchCategories } from "@/lib/store/actions/categoryActions";
import { fetchAllUsers } from "@/lib/store/actions/adminActions";
import { handleApiError } from "@/lib/store/middleware/errorMiddleware";
import { setModuleLoading } from "@/lib/store/actions/globalActions";

export const useDashboardData = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const loadDashboardData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    dispatch(setModuleLoading('admin', true));
    dispatch(setModuleLoading('category', true));
    dispatch(setModuleLoading('user', true));

    try {
      // Ana dashboard endpoint'ini kullan
      const result = await dispatch(fetchDashboard(forceRefresh));
      
      // Başarılı ise direkt dön
      if (result && !result.error) {
        return { success: true };
      }

      // Dashboard endpoint başarısız olduysa, fallback mekanizması
      console.warn("Dashboard API failed, falling back to individual calls");

      const results = await Promise.allSettled([
        dispatch(fetchCategories()),
        dispatch(fetchAllUsers()),
      ]);

      const failures = results.filter((r) => r.status === "rejected");
      
      if (failures.length > 0) {
        console.warn("Some dashboard data requests failed:", failures);
        
        if (failures.length < results.length) {
          setError("Bazı veriler yüklenemedi. Sayfa kısmi olarak yüklendi.");
          return { partial: true };
        } else {
          throw new Error("Tüm veri istekleri başarısız oldu");
        }
      }

      return { success: true };
    } catch (err) {
      console.error("Dashboard data loading error:", err);

      const isNetworkError =
        err.message === "Network Error" ||
        err.name === "NetworkError" ||
        !navigator.onLine;

      // ✅ PROBLEM #2 ÇÖZÜMÜ: Daha yumuşak retry stratejisi
      if (isNetworkError && retryCount < MAX_RETRIES) {
        const nextRetry = retryCount + 1;
        setRetryCount(nextRetry);

        // Daha kullanıcı dostu backoff: 2s, 3s, 4s (eskiden 1s, 2s, 4s)
        const backoffTime = Math.min(2000 + (retryCount * 1000), 5000);
        
        setError(`Bağlantı hatası. ${nextRetry}/${MAX_RETRIES} yeniden deneniyor... (${backoffTime/1000}s)`);
        
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
        return loadDashboardData(forceRefresh);
      }

      // Retry limiti aşıldı veya network error değil
      const errorResult = handleApiError(err, dispatch, 'loadDashboardData');
      
      // ✅ PROBLEM #5 ÇÖZÜMÜ: Detaylı hata mesajları
      let detailedError = errorResult.error;
      
      if (isNetworkError) {
        detailedError = `İnternet bağlantısı kurulamadı. Lütfen bağlantınızı kontrol edin ve tekrar deneyin. (${MAX_RETRIES} deneme tamamlandı)`;
      } else if (err.response?.status === 403) {
        detailedError = "Bu sayfayı görüntüleme yetkiniz bulunmuyor. Lütfen yönetici ile iletişime geçin.";
      } else if (err.response?.status === 500) {
        detailedError = "Sunucu hatası oluştu. Lütfen birkaç dakika sonra tekrar deneyin.";
      }
      
      setError(detailedError);
      return { error: detailedError };
    } finally {
      setLoading(false);
      dispatch(setModuleLoading('admin', false));
      dispatch(setModuleLoading('category', false));
      dispatch(setModuleLoading('user', false));
    }
  }, [dispatch, retryCount]);

  const retry = useCallback(() => {
    setRetryCount(0);
    setError(null);
    loadDashboardData(true); // Force refresh
  }, [loadDashboardData]);

  return {
    loading,
    error,
    loadDashboardData,
    retry,
    retryCount,
    maxRetries: MAX_RETRIES,
  };
};