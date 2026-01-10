import { useState, useCallback, useRef, useEffect } from "react";
import { instance } from "@/lib/hooks";
import { useToast } from "@/hooks/use-toast";

/**
 * Sipariş işlemleri için memory-safe hook
 * - Status update
 * - Order cancel
 * - Order detail fetch
 * Memory leak koruması içerir
 */
export const useOrderActions = ({ onSuccess, updateOrderLocally }) => {
  const { toast } = useToast();

  // State
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Refs
  const mountedRef = useRef(true);
  const updateInProgressRef = useRef(false);

  /**
   * Sipariş durumunu güncelle (Optimistic Update)
   */
  const updateOrderStatus = useCallback(
    async (orderId, newStatus) => {
      // Eşzamanlı güncelleme engelleme
      if (updateInProgressRef.current) {
        console.log("⚠️ Update already in progress, skipping");
        return;
      }

      updateInProgressRef.current = true;
      setIsUpdating(true);

      // Optimistic update (önce local state'i güncelle)
      const previousStatus = selectedOrder?.orderStatus;
      updateOrderLocally(orderId, { orderStatus: newStatus });
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }

      try {
        console.log(`🔄 Updating order ${orderId} status to ${newStatus}`);
        await instance.patch(
          `/orders/${orderId}/status?status=${newStatus}`,
          null,
          {
            // timeout: 5000,
          }
        );

        if (!mountedRef.current) return;

        console.log("✅ Order status updated successfully");
        toast({
          title: "Başarılı",
          description: "Sipariş durumu güncellendi",
        });

        // Backend'den güncel veriyi al (optional)
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        if (!mountedRef.current) return;

        console.error("❌ Update order status error:", error);

        // Rollback optimistic update
        updateOrderLocally(orderId, { orderStatus: previousStatus });
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, orderStatus: previousStatus }));
        }

        toast({
          title: "Hata",
          description: "Sipariş durumu güncellenemedi",
          variant: "destructive",
        });
      } finally {
        if (mountedRef.current) {
          setIsUpdating(false);
        }
        updateInProgressRef.current = false;
      }
    },
    [selectedOrder, updateOrderLocally, toast, onSuccess]
  );

  /**
   * Siparişi iptal et (Optimistic Update)
   */
  const cancelOrder = useCallback(
    async (orderId) => {
      if (updateInProgressRef.current) {
        console.log("⚠️ Update already in progress, skipping");
        return;
      }

      // Onay iste
      const confirmed = window.confirm(
        "Bu siparişi iptal etmek istediğinizden emin misiniz?"
      );
      if (!confirmed) return;

      updateInProgressRef.current = true;
      setIsUpdating(true);

      // Optimistic update
      const previousStatus = selectedOrder?.orderStatus;
      updateOrderLocally(orderId, { orderStatus: "CANCELLED" });
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: "CANCELLED" }));
      }

      try {
        console.log(`❌ Cancelling order ${orderId}`);
        await instance.post(`/orders/${orderId}/cancel`, null, {
          // timeout: 5000,
        });

        if (!mountedRef.current) return;

        console.log("✅ Order cancelled successfully");
        toast({
          title: "Başarılı",
          description: "Sipariş iptal edildi",
        });

        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        if (!mountedRef.current) return;

        console.error("❌ Cancel order error:", error);

        // Rollback
        updateOrderLocally(orderId, { orderStatus: previousStatus });
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, orderStatus: previousStatus }));
        }

        toast({
          title: "Hata",
          description: "Sipariş iptal edilemedi",
          variant: "destructive",
        });
      } finally {
        if (mountedRef.current) {
          setIsUpdating(false);
        }
        updateInProgressRef.current = false;
      }
    },
    [selectedOrder, updateOrderLocally, toast, onSuccess]
  );

  /**
   * Sipariş detayını getir (Modal için)
   */
  const fetchOrderDetail = useCallback(
    async (orderId) => {
      try {
        console.log(`� Fetching order details for ID: ${orderId}`);
        const response = await instance.get(`/orders/${orderId}`, {
          // timeout: 5000,
        });

        if (!mountedRef.current) return null;

        console.log("✅ Order detail fetched");
        setSelectedOrder(response.data);
        return response.data;
      } catch (error) {
        if (!mountedRef.current) return null;

        console.error("❌ Fetch order detail error:", error);
        toast({
          title: "Hata",
          description: "Sipariş detayı yüklenemedi",
          variant: "destructive",
        });
        return null;
      }
    },
    [toast]
  );

  /**
   * Seçili siparişi temizle
   */
  const clearSelectedOrder = useCallback(() => {
    setSelectedOrder(null);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      updateInProgressRef.current = false;
    };
  }, []);

  return {
    isUpdating,
    selectedOrder,
    updateOrderStatus,
    cancelOrder,
    fetchOrderDetail,
    clearSelectedOrder,
  };
};