import { useState, useEffect, useCallback, useRef } from "react";
import { instance } from "@/lib/hooks";
import { useToast } from "@/lib/hooks/useToast";
import { useSocket } from "@/lib/providers/SocketProvider";

/**
 * Orders sayfası için optimize edilmiş veri yönetimi hook'u
 * Smart polling, cache, ve memory leak koruması içerir
 */
export const useOrdersManager = ({ onNewOrder } = {}) => {
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
      const response = await instance.get("/orders/admin/paged", {
        signal,
        params: {
          size: 1000,
          sort: "orderDate,desc"
        }
        // timeout: REQUEST_TIMEOUT,
      });
      return response.data.content || [];
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

  // Real-time updates with Socket.IO
  const { socket } = useSocket();

  useEffect(() => {
    console.log("🔌 [useOrdersManager] Socket effect triggered");
    console.log("   Socket available:", !!socket);
    console.log("   Socket connected:", socket?.connected);
    console.log("   Socket ID:", socket?.id);

    if (!socket) {
      console.warn("⚠️ [useOrdersManager] Socket not available yet");
      return;
    }

    console.log("✅ [useOrdersManager] Setting up socket event listeners");

    // Join Admin Room (Try common patterns)
    console.log("📤 [useOrdersManager] Emitting 'join' event with 'admin'");
    socket.emit('join', 'admin', (response) => {
      console.log("✅ [useOrdersManager] Join acknowledgment:", response);
    });

    console.log("📤 [useOrdersManager] Emitting 'subscribe' event with 'orders'");
    socket.emit('subscribe', 'orders', (response) => {
      console.log("✅ [useOrdersManager] Subscribe acknowledgment:", response);
    });

    // Handler for new orders (receives OrderSocketDTO from backend)
    const handleOrderCreated = (orderDTO) => {
      console.log("🆕 [useOrdersManager] New order received via socket:", orderDTO);

      // Transform DTO to match frontend order structure
      const newOrder = {
        id: orderDTO.id,
        orderStatus: orderDTO.orderStatus,
        totalAmount: orderDTO.totalAmount,
        orderDate: orderDTO.orderDate,
        userName: orderDTO.userName,
        userEmail: orderDTO.userEmail,
        deliveryAddress: orderDTO.deliveryAddress,
        items: orderDTO.items,
        // Add user object for compatibility
        user: orderDTO.userName ? {
          name: orderDTO.userName,
          email: orderDTO.userEmail
        } : null
      };

      setOrders((prevOrders) => {
        // Prevent duplicates
        if (prevOrders.some(o => o.id === newOrder.id)) {
          console.log("⚠️ [useOrdersManager] Order already exists, skipping");
          return prevOrders;
        }
        console.log("✅ [useOrdersManager] Adding new order to list");
        return [newOrder, ...prevOrders];
      });

      toast({
        title: "Yeni Sipariş!",
        description: `#${newOrder.id} numaralı sipariş alındı.`,
        className: "bg-green-50 border-green-200 text-green-900"
      });

      // Play notification sound
      if (onNewOrder) {
        onNewOrder(newOrder);
      }

      // Update stats
      setLastUpdateTime(new Date());
    };

    // Handler for order updates (receives OrderSocketDTO from backend)
    const handleOrderUpdated = (orderDTO) => {
      console.log("🔄 [useOrdersManager] Order updated via socket:", orderDTO);

      // Transform DTO to match frontend order structure
      const updatedOrder = {
        id: orderDTO.id,
        orderStatus: orderDTO.orderStatus,
        totalAmount: orderDTO.totalAmount,
        orderDate: orderDTO.orderDate,
        userName: orderDTO.userName,
        userEmail: orderDTO.userEmail,
        deliveryAddress: orderDTO.deliveryAddress,
        items: orderDTO.items,
        user: orderDTO.userName ? {
          name: orderDTO.userName,
          email: orderDTO.userEmail
        } : null
      };

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
        )
      );

      setLastUpdateTime(new Date());
    };

    console.log("📝 [useOrdersManager] Registering 'order_created' listener");
    socket.on("order_created", handleOrderCreated);

    console.log("📝 [useOrdersManager] Registering 'order_updated' listener");
    socket.on("order_updated", handleOrderUpdated);

    // DEBUG: Listen to all events
    socket.onAny((eventName, ...args) => {
      console.log(`📡 [useOrdersManager] Incoming Event: ${eventName}`, args);
    });

    console.log("✅ [useOrdersManager] All socket listeners registered");

    return () => {
      console.log("🧹 [useOrdersManager] Cleaning up socket listeners");
      socket.off("order_created", handleOrderCreated);
      socket.off("order_updated", handleOrderUpdated);
      socket.offAny();
    };
  }, [socket, toast]);

  const addOrder = useCallback((newOrder) => {
    console.log("⚡ [Hook] addOrder called", newOrder);
    setOrders(prev => {
      console.log("⚡ [Hook] Previous orders:", prev.length);
      return [newOrder, ...prev];
    });
  }, []);

  return {
    orders,
    loading,
    isRefreshing,
    lastUpdateTime,
    refreshOrders,
    updateOrderLocally,
    fetchOrders,
    addOrder, // Exposed for testing/simulation
  };
};