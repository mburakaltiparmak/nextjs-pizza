/**
 * useOrderFilters Hook
 * Specialized hook for filtering and calculating statistics for orders
 * 
 * @param {Array} orders - Orders array to filter
 * @returns {Object} Filtered orders, statistics, and filter controls
 */

import { useState, useMemo, useCallback } from "react";
import { ORDER_STATUS } from "@/lib/utils/adminConstants";

export const useOrderFilters = (orders) => {
    const [statusFilter, setStatusFilter] = useState(ORDER_STATUS.ALL);
    const [searchTerm, setSearchTerm] = useState("");

    /**
     * Calculate order statistics
     */
    const stats = useMemo(() => {
        if (!orders || !Array.isArray(orders)) {
            return {
                total: 0,
                pending: 0,
                confirmed: 0,
                preparing: 0,
                shipping: 0,
                delivered: 0,
                cancelled: 0
            };
        }

        return {
            total: orders.length,
            pending: orders.filter(o => o.orderStatus === ORDER_STATUS.PENDING).length,
            confirmed: orders.filter(o => o.orderStatus === ORDER_STATUS.CONFIRMED).length,
            preparing: orders.filter(o => o.orderStatus === ORDER_STATUS.PREPARING).length,
            shipping: orders.filter(o => o.orderStatus === ORDER_STATUS.SHIPPING).length,
            delivered: orders.filter(o => o.orderStatus === ORDER_STATUS.DELIVERED).length,
            cancelled: orders.filter(o => o.orderStatus === ORDER_STATUS.CANCELLED).length
        };
    }, [orders]);

    /**
     * Filter orders by status
     */
    const filterByStatus = useCallback((ordersList, status) => {
        if (status === ORDER_STATUS.ALL) return ordersList;
        return ordersList.filter(order => order.orderStatus === status);
    }, []);

    /**
     * Filter orders by search term
     */
    const filterBySearch = useCallback((ordersList, search) => {
        if (!search) return ordersList;

        const searchLower = search.toLowerCase();

        return ordersList.filter(order => {
            // Order ID
            const orderId = order.id?.toString() || "";
            if (orderId.includes(searchLower)) return true;

            // Customer name
            const customerName = (
                order.userName ||
                order.deliveryAddress?.recipientName ||
                ""
            ).toLowerCase();
            if (customerName.includes(searchLower)) return true;

            // Customer email
            const customerEmail = (order.userEmail || "").toLowerCase();
            if (customerEmail.includes(searchLower)) return true;

            // Address
            if (order.deliveryAddress) {
                const address = `${order.deliveryAddress.fullAddress || ""} ${order.deliveryAddress.district || ""} ${order.deliveryAddress.city || ""}`.toLowerCase();
                if (address.includes(searchLower)) return true;
            }

            // Phone number
            const phone = (order.deliveryAddress?.phoneNumber || "").toLowerCase();
            if (phone.includes(searchLower)) return true;

            return false;
        });
    }, []);

    /**
     * Filtered orders (combined filters)
     */
    const filteredOrders = useMemo(() => {
        if (!orders || !Array.isArray(orders)) return [];

        let filtered = [...orders];

        // Apply status filter
        filtered = filterByStatus(filtered, statusFilter);

        // Apply search filter
        filtered = filterBySearch(filtered, searchTerm);

        return filtered;
    }, [orders, statusFilter, searchTerm, filterByStatus, filterBySearch]);

    /**
     * Reset all filters
     */
    const resetFilters = useCallback(() => {
        setStatusFilter(ORDER_STATUS.ALL);
        setSearchTerm("");
    }, []);

    /**
     * Set status filter
     */
    const handleStatusChange = useCallback((status) => {
        setStatusFilter(status);
    }, []);

    /**
     * Set search term
     */
    const handleSearchChange = useCallback((search) => {
        setSearchTerm(search);
    }, []);

    /**
     * Check if filters are active
     */
    const hasActiveFilters = useMemo(() => {
        return statusFilter !== ORDER_STATUS.ALL || searchTerm !== "";
    }, [statusFilter, searchTerm]);

    return {
        // Filtered data
        filteredOrders,

        // Statistics
        stats,

        // Filter state
        statusFilter,
        searchTerm,
        hasActiveFilters,

        // Filter controls
        setStatusFilter: handleStatusChange,
        setSearchTerm: handleSearchChange,
        resetFilters
    };
};

/**
 * Usage Example:
 * 
 * const {
 *   filteredOrders,
 *   stats,
 *   statusFilter,
 *   searchTerm,
 *   setStatusFilter,
 *   setSearchTerm,
 *   resetFilters
 * } = useOrderFilters(orders);
 * 
 * // In component
 * <OrderFilters
 *   statusFilter={statusFilter}
 *   searchTerm={searchTerm}
 *   stats={stats}
 *   onStatusChange={setStatusFilter}
 *   onSearchChange={setSearchTerm}
 *   onReset={resetFilters}
 * />
 * 
 * <OrdersTable orders={filteredOrders} />
 */
