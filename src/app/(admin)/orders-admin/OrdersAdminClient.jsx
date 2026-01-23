"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuthRoute from "@/lib/hooks/useAuthRole";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/Pagination";

// Order Components
import { OrderFilters } from "@/components/admin/orders/OrderFilters";
import { OrdersTable } from "@/components/admin/orders/OrdersTable";
import { OrderDetailModal } from "@/components/admin/orders/OrderDetailModal";

// Custom Hooks
import { useOrdersManager } from "@/lib/hooks/useOrdersManager";
import { useOrderActions } from "@/lib/hooks/useOrderActions";
import { useOrderFilters } from "@/lib/hooks/admin/useOrderFilters";
import { useNotificationSound } from "@/lib/hooks/useNotificationSound";
import { useModal } from "@/lib/hooks/admin/useModal";

// UI Components
import { SocketStatusIndicator, SoundToggle } from "@/components/admin/layout";
import { formatDateTime } from "@/lib/utils/dateUtils";

const OrdersAdminClient = () => {
    // Auth
    const { isAuthorized } = useAuthRoute(["ADMIN", "PERSONAL"], "/");
    const router = useRouter();

    // Notification Sound
    const notificationSound = useNotificationSound();

    // Orders Data Management
    const {
        orders,
        loading,
        isRefreshing,
        lastUpdateTime,
        pagination,
        refreshOrders,
        fetchOrders
    } = useOrdersManager({
        onNewOrder: () => notificationSound.play()
    });

    // Order Filtering
    const {
        filteredOrders,
        stats,
        statusFilter,
        searchTerm,
        setStatusFilter,
        setSearchTerm,
        resetFilters
    } = useOrderFilters(orders);

    // Order Actions
    const {
        isUpdating,
        selectedOrder,
        updateOrderStatus,
        fetchOrderDetail,
        clearSelectedOrder
    } = useOrderActions({
        onSuccess: refreshOrders,
        updateOrderLocally: (id, updates) => {
            // Updates are handled via Redux/refresh
        }
    });

    // Detail Modal
    const detailModal = useModal();

    // Handlers
    const handleShowDetail = async (orderId) => {
        const order = await fetchOrderDetail(orderId);
        if (order) {
            detailModal.open();
        }
    };

    const handleCloseDetail = () => {
        detailModal.close();
        clearSelectedOrder();
    };

    if (!isAuthorized) {
        return null;
    }

    return (
        <div>
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-lightgray">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-darkgray font-Barlow">
                            Siparişler
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 font-Barlow flex items-center gap-2">
                            {loading ? (
                                <span className="h-4 w-24 bg-lightgray animate-pulse rounded inline-block"></span>
                            ) : (
                                <>
                                    <span>Toplam {stats.total} sipariş</span>
                                    {lastUpdateTime && (
                                        <span className="ml-2">
                                            • Son güncelleme: {formatDateTime(lastUpdateTime)}
                                        </span>
                                    )}
                                </>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <SocketStatusIndicator />
                        <SoundToggle
                            isEnabled={notificationSound.isEnabled}
                            isMuted={notificationSound.isMuted}
                            onToggleEnabled={notificationSound.toggleEnabled}
                            onToggleMute={notificationSound.toggleMute}
                        />
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
                </div>

                {/* Filter Results Info */}
                {!loading && filteredOrders.length !== stats.total && (
                    <p className="text-sm text-gray-600 font-Barlow">
                        {filteredOrders.length} sipariş gösteriliyor ({stats.total} siparişten)
                    </p>
                )}
            </div>

            {/* Filters */}
            <OrderFilters
                statusFilter={statusFilter}
                searchTerm={searchTerm}
                onStatusChange={setStatusFilter}
                onSearchChange={setSearchTerm}
                onReset={resetFilters}
                stats={stats}
                loading={loading}
            />

            {/* Orders Table/Cards */}
            <OrdersTable
                orders={filteredOrders}
                onViewDetail={handleShowDetail}
                filteredCount={filteredOrders.length}
                totalCount={stats.total}
                isLoading={loading || isRefreshing}
            />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(page) => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        fetchOrders(page);
                    }}
                />
            )}

            {/* Order Detail Modal */}
            <OrderDetailModal
                open={detailModal.isOpen}
                onClose={handleCloseDetail}
                order={selectedOrder}
                onUpdateStatus={updateOrderStatus}
                isUpdating={isUpdating}
            />
        </div>
    );
};

export default OrdersAdminClient;
