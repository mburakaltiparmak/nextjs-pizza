"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import useAuthRoute from "@/lib/hooks/useAuthRole"; // Updated import
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"; // Updated import

// Order Components
import { OrderFilters } from "@/components/admin/orders/OrderFilters";
import { OrdersTable } from "@/components/admin/orders/OrdersTable";
import { OrderDetailModal } from "@/components/admin/orders/OrderDetailModal";

// Custom Hooks
import { useOrdersManager } from "@/lib/hooks/useOrdersManager"; // Updated import
import { useOrderActions } from "@/lib/hooks/useOrderActions"; // Updated import

const OrdersAdminClient = () => {
    // Auth
    const { isAuthorized } = useAuthRoute(["ADMIN", "PERSONAL"], "/");
    const router = useRouter();

    // State
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Custom Hooks
    const {
        orders,
        loading,
        isRefreshing,
        lastUpdateTime,
        refreshOrders,
        updateOrderLocally,
    } = useOrdersManager();

    const {
        isUpdating,
        selectedOrder,
        updateOrderStatus,
        fetchOrderDetail,
        clearSelectedOrder,
    } = useOrderActions({
        onSuccess: () => refreshOrders(),
        updateOrderLocally,
    });

    // Filter statistics
    const filterStats = useMemo(() => {
        if (!orders) return {
            total: 0,
            pending: 0,
            confirmed: 0,
            preparing: 0,
            shipping: 0,
            delivered: 0,
            cancelled: 0,
        };

        return {
            total: orders.length,
            pending: orders.filter(o => o.orderStatus === "PENDING").length,
            confirmed: orders.filter(o => o.orderStatus === "CONFIRMED").length,
            preparing: orders.filter(o => o.orderStatus === "PREPARING").length,
            shipping: orders.filter(o => o.orderStatus === "SHIPPING").length,
            delivered: orders.filter(o => o.orderStatus === "DELIVERED").length,
            cancelled: orders.filter(o => o.orderStatus === "CANCELLED").length,
        };
    }, [orders]);

    // Filtered orders
    const filteredOrders = useMemo(() => {
        if (!orders) return [];

        let filtered = [...orders];

        // Status filter
        if (statusFilter !== "ALL") {
            filtered = filtered.filter(order => order.orderStatus === statusFilter);
        }

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(order => {
                const orderId = order.id?.toString() || "";
                const customerName = (order.userName || order.deliveryAddress?.recipientName || "").toLowerCase();
                const customerEmail = (order.userEmail || "").toLowerCase();
                const address = order.deliveryAddress
                    ? `${order.deliveryAddress.fullAddress} ${order.deliveryAddress.district} ${order.deliveryAddress.city}`.toLowerCase()
                    : "";

                return (
                    orderId.includes(search) ||
                    customerName.includes(search) ||
                    customerEmail.includes(search) ||
                    address.includes(search)
                );
            });
        }

        return filtered;
    }, [orders, statusFilter, searchTerm]);

    // Handlers
    const handleShowDetail = async (orderId) => {
        const order = await fetchOrderDetail(orderId);
        if (order) {
            setIsDetailOpen(true);
        }
    };

    const handleCloseDetail = () => {
        setIsDetailOpen(false);
        clearSelectedOrder();
    };

    const handleStatusChange = (newStatus) => {
        setStatusFilter(newStatus);
    };

    const handleSearchChange = (value) => {
        setSearchTerm(value);
    };

    const handleResetFilters = () => {
        setStatusFilter("ALL");
        setSearchTerm("");
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Loading state
    // Auth check handled by hook, usually redirects or returns isAuthorized=false
    // Assuming hook redirects if not authorized.
    if (!isAuthorized) {
        return null;
    }

    if (loading) {
        return <LoadingSpinner size="fullPage" />;
    }

    return (
        <div>
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-lightgray">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-darkgray font-Quattrocento_Sans">
                            Siparişler
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 font-Barlow">
                            Toplam {filterStats.total} sipariş
                            {lastUpdateTime && (
                                <span className="ml-2">
                                    • Son güncelleme: {formatDate(lastUpdateTime)}
                                </span>
                            )}
                        </p>
                    </div>
                    <Button
                        onClick={refreshOrders}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 bg-red text-lightgray hover:bg-yellow hover:text-red font-Barlow"
                    >
                        <RefreshCcw
                            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                        />
                        {isRefreshing ? "Yenileniyor..." : "Yenile"}
                    </Button>
                </div>

                {/* Filter Results Info */}
                {filteredOrders.length !== filterStats.total && (
                    <p className="text-sm text-gray-600 font-Barlow">
                        {filteredOrders.length} sipariş gösteriliyor ({filterStats.total}{" "}
                        siparişten)
                    </p>
                )}
            </div>

            {/* Filters */}
            <OrderFilters
                statusFilter={statusFilter}
                searchTerm={searchTerm}
                onStatusChange={handleStatusChange}
                onSearchChange={handleSearchChange}
                onReset={handleResetFilters}
                stats={filterStats}
            />

            {/* Orders Table/Cards */}
            <OrdersTable
                orders={filteredOrders}
                onViewDetail={handleShowDetail}
                filteredCount={filteredOrders.length}
                totalCount={filterStats.total}
            />

            {/* Order Detail Modal */}
            <OrderDetailModal
                open={isDetailOpen}
                onClose={handleCloseDetail}
                order={selectedOrder}
                onUpdateStatus={updateOrderStatus}
                isUpdating={isUpdating}
            />
        </div>
    );
};

export default OrdersAdminClient;
