"use client";

import { useState, useCallback } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { fetchDashboard } from "@/lib/store/actions/adminActions";
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

    try {
      // ✅ Backend DTO endpoint'inden veri çek
      const result = await dispatch(fetchDashboard(forceRefresh));
      
      // Başarılı ise direkt dön
      if (result && !result.error) {
        console.log("✅ Dashboard data loaded successfully");
        return { success: true };
      }

      throw new Error("Dashboard yüklenemedi");
    } catch (err) {
      console.error("❌ Dashboard data loading error:", err);

      const isNetworkError =
        err.message === "Network Error" ||
        err.name === "NetworkError" ||
        !navigator.onLine;

      // ✅ Retry stratejisi
      if (isNetworkError && retryCount < MAX_RETRIES) {
        const nextRetry = retryCount + 1;
        setRetryCount(nextRetry);

        // Yumuşak backoff: 2s, 3s, 4s
        const backoffTime = Math.min(2000 + (retryCount * 1000), 5000);
        
        setError(`Bağlantı hatası. ${nextRetry}/${MAX_RETRIES} yeniden deneniyor... (${backoffTime/1000}s)`);
        
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
        return loadDashboardData(forceRefresh);
      }

      // Retry limiti aşıldı veya network error değil
      const errorResult = handleApiError(err, dispatch, 'loadDashboardData');
      
      // ✅ Detaylı hata mesajları
      let detailedError = errorResult.error;
      
      if (isNetworkError) {
        detailedError = `İnternet bağlantısı kurulamadı. Lütfen bağlantınızı kontrol edin. (${MAX_RETRIES} deneme tamamlandı)`;
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