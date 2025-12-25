import { useState, useEffect, useCallback, useRef } from "react";
import { instance } from "@/lib/hooks";
import { useToast } from "@/hooks/use-toast";

/**
 * Orders sayfası için optimize edilmiş veri yönetimi hook'u
 * Smart polling, cache, ve memory leak koruması içerir
 */
export const useOrdersManager = () => {
  const { toast } = useToast();

  // State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  // Refs
  const mountedRef = useRef(true);
  const abortControllerRef = useRef(null);
  const lastFetchTimeRef = useRef(0);
  const pollingIntervalRef = useRef(null);
  const initialFetchDoneRef = useRef(false);

  // Configuration
  const POLLING_INTERVAL = 30000; // 30 saniye (daha uzun)
  const MIN_FETCH_INTERVAL = 5000; // Minimum 5 saniye
  const REQUEST_TIMEOUT = 15000; // 15 saniye

  /**
   * API isteği yapar (abort controller ile)
   */
  const fetchOrdersFromAPI = useCallback(async (signal) => {
    try {
      const response = await instance.get("/orders", {
        signal,
        // timeout: REQUEST_TIMEOUT,
      });
      return response.data;
    } catch (error) {
      // Abort veya cancel hataları sessizce geç
      if (error.name === "AbortError" || error.name === "CanceledError") {
        return null;
      }
      throw error;
    }
  }, []);

  /**
   * Siparişleri yükle (throttling ile)
   */
  const fetchOrders = useCallback(
    async (force = false, silent = false) => {
      // Throttle kontrolü
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTimeRef.current;

      if (!force && timeSinceLastFetch < MIN_FETCH_INTERVAL) {
        console.log(
          `⏭️ Fetch throttled (${Math.round(timeSinceLastFetch / 1000)}s)`
        );
        return;
      }

      // Önceki isteği iptal et
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Yeni AbortController
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Loading state
      if (!silent) {
        if (initialFetchDoneRef.current) {
          setIsRefreshing(true);
        } else {
          setLoading(true);
        }
      }

      try {
        console.log("🔄 Fetching orders...");
        const data = await fetchOrdersFromAPI(abortController.signal);

        // Component unmount olduysa state güncelleme
        if (!mountedRef.current || data === null) return;

        setOrders(data);
        setLastUpdateTime(new Date());
        lastFetchTimeRef.current = now;
        initialFetchDoneRef.current = true;

        console.log(`✅ Orders fetched: ${data.length} items`);
      } catch (error) {
        if (!mountedRef.current) return;

        console.error("❌ Fetch orders error:", error);
        toast({
          title: "Hata",
          description: "Siparişler yüklenirken bir sorun oluştu",
          variant: "destructive",
        });
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setIsRefreshing(false);
        }
        abortControllerRef.current = null;
      }
    },
    [fetchOrdersFromAPI, toast]
  );

  /**
   * Polling'i başlat
   */
  const startPolling = useCallback(() => {
    // Zaten polling varsa iptal et
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    console.log("🔁 Polling started (30s interval)");
    pollingIntervalRef.current = setInterval(() => {
      console.log("⏰ Polling tick - fetching orders");
      fetchOrders(false, true); // force=false, silent=true
    }, POLLING_INTERVAL);
  }, [fetchOrders, POLLING_INTERVAL]);

  /**
   * Polling'i durdur
   */
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log("⏸️ Polling stopped");
    }
  }, []);

  /**
   * Manuel yenileme
   */
  const refreshOrders = useCallback(() => {
    console.log("🔄 Manual refresh triggered");
    fetchOrders(true, false); // force=true, silent=false
  }, [fetchOrders]);

  /**
   * Optimistic update - sipariş durumu değiştiğinde
   */
  const updateOrderLocally = useCallback((orderId, updates) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, ...updates } : order
      )
    );
  }, []);

  // Initial fetch only (polling disabled to avoid rate limit issues)
  useEffect(() => {
    // İlk yükleme - sadece bir kere çalışmalı
    const initialFetch = async () => {
      // Throttle kontrolü
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTimeRef.current;

      if (timeSinceLastFetch < MIN_FETCH_INTERVAL) {
        console.log(
          `⏭️ Initial fetch throttled (${Math.round(timeSinceLastFetch / 1000)}s)`
        );
        return;
      }

      // Yeni AbortController
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setLoading(true);

      try {
        console.log("🔄 Initial fetch - loading orders...");
        const response = await instance.get("/orders/admin/paged", { // Changed to paged endpoint
          params: {
            size: 1000, // Large size to get all orders
            sort: "orderDate,desc"
          },
          signal: abortController.signal,
        });

        if (!mountedRef.current) return;

        const ordersData = response.data.content || []; // Extract content
        setOrders(ordersData);
        setLastUpdateTime(new Date());
        lastFetchTimeRef.current = now;
        initialFetchDoneRef.current = true;

        console.log(`✅ Initial orders loaded: ${ordersData.length} items`);
      } catch (error) {
        if (!mountedRef.current) return;

        // Abort veya cancel hataları sessizce geç
        if (error.name === "AbortError" || error.name === "CanceledError") {
          console.log("⏹️ Initial fetch aborted");
          return;
        }

        console.error("❌ Initial fetch error:", error);
        toast({
          title: "Hata",
          description: "Siparişler yüklenirken bir sorun oluştu",
          variant: "destructive",
        });
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
        abortControllerRef.current = null;
      }
    };

    initialFetch();

    // Cleanup
    return () => {
      console.log("🧹 Cleanup: unmounting useOrdersManager");
      mountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - run only once on mount

  // Page visibility polling disabled (prevents rate limit issues)
  // Users can manually refresh if needed
  /*
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("👁️ Page hidden - stopping polling");
        stopPolling();
      } else {
        console.log("👁️ Page visible - starting polling");
        fetchOrders(true, true); // Hemen yenile
        startPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [stopPolling, startPolling, fetchOrders]);
  */

  return {
    orders,
    loading,
    isRefreshing,
    lastUpdateTime,
    refreshOrders,
    updateOrderLocally,
    fetchOrders, // Acil durumlarda kullanım için
  };
};