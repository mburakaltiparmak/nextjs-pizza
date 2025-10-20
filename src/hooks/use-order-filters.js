// src/hooks/useOrderFilters.js
import { useState, useMemo, useCallback } from "react";

/**
 * Sipariş filtreleme ve arama için optimize edilmiş hook
 * useMemo ile performans optimizasyonu
 */
export const useOrderFilters = (orders) => {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * Optimize edilmiş filtreleme (useMemo ile)
   */
  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) {
      return [];
    }

    console.log(
      `🔍 Filtering orders: status=${statusFilter}, search="${searchTerm}"`
    );

    let result = orders;

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Search filter (ID, kullanıcı adı, adres)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      result = result.filter((order) => {
        // Order ID
        if (order.id?.toString().includes(searchLower)) return true;

        // User name
        const userName = order.user?.name || order.user?.username || "";
        if (userName.toLowerCase().includes(searchLower)) return true;

        // Address
        const address = order.address?.toLowerCase() || "";
        if (address.includes(searchLower)) return true;

        return false;
      });
    }

    console.log(`✅ Filtered: ${result.length}/${orders.length} orders`);
    return result;
  }, [orders, statusFilter, searchTerm]);

  /**
   * Filter reset
   */
  const resetFilters = useCallback(() => {
    setStatusFilter("ALL");
    setSearchTerm("");
  }, []);

  /**
   * Status değiştir
   */
  const handleStatusChange = useCallback((newStatus) => {
    setStatusFilter(newStatus);
  }, []);

  /**
   * Search değiştir (debounced değil, useMemo yeterince hızlı)
   */
  const handleSearchChange = useCallback((newSearch) => {
    setSearchTerm(newSearch);
  }, []);

  /**
   * Filtreleme stats
   */
  const filterStats = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        total: 0,
        filtered: 0,
        pending: 0,
        confirmed: 0,
        preparing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
      };
    }

    const stats = {
      total: orders.length,
      filtered: filteredOrders.length,
      pending: 0,
      confirmed: 0,
      preparing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      const status = order.status?.toLowerCase();
      if (stats[status] !== undefined) {
        stats[status]++;
      }
    });

    return stats;
  }, [orders, filteredOrders]);

  return {
    statusFilter,
    searchTerm,
    filteredOrders,
    filterStats,
    handleStatusChange,
    handleSearchChange,
    resetFilters,
  };
};