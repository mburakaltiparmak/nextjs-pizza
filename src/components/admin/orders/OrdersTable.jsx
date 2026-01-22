"use client";

import { ShoppingBag } from "lucide-react";
import { OrderTableRow } from "./OrderTableRow";
import { OrderMobileCard } from "./OrderMobileCard";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SortableTableHeader } from "@/components/ui/SortableTableHeader";
import { useTableSort } from "@/lib/hooks/admin/useTableSort";
import { SORT_DIRECTION } from "@/lib/utils/adminConstants";

export const OrdersTable = ({ orders, onViewDetail, filteredCount, totalCount, isLoading }) => {
    // Use custom sort hook with custom sort function for customer field
    const { sortedData, sortField, sortDirection, handleSort } = useTableSort(
        orders,
        "orderDate",
        SORT_DIRECTION.DESC,
        {
            // Custom sort function for customer field
            customer: (a, b, direction) => {
                const aName = (a.userName || a.deliveryAddress?.recipientName || "").toLowerCase();
                const bName = (b.userName || b.deliveryAddress?.recipientName || "").toLowerCase();
                const comparison = aName.localeCompare(bName);
                return direction === SORT_DIRECTION.ASC ? comparison : -comparison;
            }
        }
    );

    if (isLoading) {
        return <TableSkeleton rowCount={10} columnCount={8} />;
    }

    if (!orders || orders.length === 0) {
        return (
            <EmptyState
                icon={ShoppingBag}
                title="Sipariş Bulunamadı"
                description={
                    filteredCount !== totalCount
                        ? "Arama kriterlerinizle eşleşen sipariş bulunamadı."
                        : "Henüz hiç sipariş yok."
                }
            />
        );
    }

    return (
        <>
            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-lightgray overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-lightgray/50">
                            <tr className="border-b border-lightgray2">
                                <SortableTableHeader
                                    field="id"
                                    label="Sipariş No"
                                    currentSortField={sortField}
                                    sortDirection={sortDirection}
                                    onSort={handleSort}
                                    className="whitespace-nowrap"
                                />
                                <SortableTableHeader
                                    field="customer"
                                    label="Müşteri"
                                    currentSortField={sortField}
                                    sortDirection={sortDirection}
                                    onSort={handleSort}
                                    className="min-w-[180px]"
                                />
                                <SortableTableHeader
                                    field="orderDate"
                                    label="Tarih"
                                    currentSortField={sortField}
                                    sortDirection={sortDirection}
                                    onSort={handleSort}
                                    className="whitespace-nowrap"
                                />
                                <th className="px-6 py-4 text-left text-sm font-bold text-darkgray font-Barlow whitespace-nowrap">
                                    Ürünler
                                </th>
                                <SortableTableHeader
                                    field="totalAmount"
                                    label="Toplam"
                                    currentSortField={sortField}
                                    sortDirection={sortDirection}
                                    onSort={handleSort}
                                    className="whitespace-nowrap"
                                />
                                <th className="px-6 py-4 text-left text-sm font-bold text-darkgray font-Barlow min-w-[160px]">
                                    Ödeme
                                </th>
                                <SortableTableHeader
                                    field="orderStatus"
                                    label="Durum"
                                    currentSortField={sortField}
                                    sortDirection={sortDirection}
                                    onSort={handleSort}
                                    className="whitespace-nowrap"
                                />
                                <th className="px-6 py-4 text-right text-sm font-bold text-darkgray font-Barlow whitespace-nowrap">
                                    İşlemler
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.map((order) => (
                                <OrderTableRow
                                    key={order.id}
                                    order={order}
                                    onViewDetail={onViewDetail}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View - Visible only on mobile/tablet */}
            <div className="lg:hidden space-y-4">
                {/* Mobile Sort Selector */}
                <div className="bg-white rounded-lg shadow-sm border border-lightgray p-3">
                    <div className="flex items-center justify-between gap-3">
                        <label className="text-sm font-medium text-darkgray font-Barlow">
                            Sırala:
                        </label>
                        <select
                            value={`${sortField}-${sortDirection}`}
                            onChange={(e) => {
                                const [field, direction] = e.target.value.split("-");
                                handleSort(field);
                                if (sortDirection !== direction) {
                                    handleSort(field); // Toggle again if needed
                                }
                            }}
                            className="flex-1 px-3 py-2 border border-lightgray2 rounded-lg font-Barlow text-sm focus:outline-none focus:ring-2 focus:ring-red"
                        >
                            <option value="orderDate-desc">Tarih (Yeniden Eskiye)</option>
                            <option value="orderDate-asc">Tarih (Eskiden Yeniye)</option>
                            <option value="totalAmount-desc">Tutar (Büyükten Küçüğe)</option>
                            <option value="totalAmount-asc">Tutar (Küçükten Büyüğe)</option>
                            <option value="id-desc">Sipariş No (Büyükten Küçüğe)</option>
                            <option value="id-asc">Sipariş No (Küçükten Büyüğe)</option>
                            <option value="customer-asc">Müşteri (A-Z)</option>
                            <option value="customer-desc">Müşteri (Z-A)</option>
                            <option value="orderStatus-asc">Durum (A-Z)</option>
                            <option value="orderStatus-desc">Durum (Z-A)</option>
                        </select>
                    </div>
                </div>

                {/* Mobile Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedData.map((order) => (
                        <OrderMobileCard
                            key={order.id}
                            order={order}
                            onViewDetail={onViewDetail}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};
