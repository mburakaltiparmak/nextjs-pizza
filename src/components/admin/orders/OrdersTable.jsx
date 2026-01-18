"use client";

import { useState, useMemo } from "react";
import { ShoppingBag, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { OrderTableRow } from "./OrderTableRow";
import { OrderMobileCard } from "./OrderMobileCard";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";

export const OrdersTable = ({ orders, onViewDetail, filteredCount, totalCount, isLoading }) => {
    const [sortField, setSortField] = useState("orderDate");
    const [sortDirection, setSortDirection] = useState("desc");

    // Handle column sort
    const handleSort = (field) => {
        if (sortField === field) {
            // Toggle direction
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            // New field, default to descending
            setSortField(field);
            setSortDirection("desc");
        }
    };

    // Sort orders
    const sortedOrders = useMemo(() => {
        if (!orders) return [];

        const sorted = [...orders].sort((a, b) => {
            let aValue, bValue;

            switch (sortField) {
                case "id":
                    aValue = a.id;
                    bValue = b.id;
                    break;
                case "orderDate":
                    aValue = new Date(a.orderDate);
                    bValue = new Date(b.orderDate);
                    break;
                case "totalAmount":
                    aValue = a.totalAmount || 0;
                    bValue = b.totalAmount || 0;
                    break;
                case "orderStatus":
                    aValue = a.orderStatus;
                    bValue = b.orderStatus;
                    break;
                case "customer":
                    aValue = (a.userName || a.deliveryAddress?.recipientName || "").toLowerCase();
                    bValue = (b.userName || b.deliveryAddress?.recipientName || "").toLowerCase();
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
            if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [orders, sortField, sortDirection]);

    // Render sort icon
    const SortIcon = ({ field }) => {
        if (sortField !== field) {
            return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
        }
        return sortDirection === "asc" ? (
            <ArrowUp className="w-4 h-4 text-blue-600" />
        ) : (
            <ArrowDown className="w-4 h-4 text-blue-600" />
        );
    };

    if (isLoading) {
        return <TableSkeleton rowCount={10} columnCount={8} />;
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-lightgray">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-darkgray mb-2 font-Barlow">
                    Sipariş Bulunamadı
                </h3>
                <p className="text-gray-500 font-Barlow">
                    {filteredCount !== totalCount
                        ? "Arama kriterlerinizle eşleşen sipariş bulunamadı."
                        : "Henüz hiç sipariş yok."}
                </p>
            </div>
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
                                <th
                                    className="px-6 py-4 text-left text-sm font-bold text-darkgray font-Barlow whitespace-nowrap cursor-pointer hover:bg-lightgray/70 transition-colors"
                                    onClick={() => handleSort("id")}
                                >
                                    <div className="flex items-center gap-2">
                                        Sipariş No
                                        <SortIcon field="id" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-left text-sm font-bold text-darkgray font-Barlow min-w-[180px] cursor-pointer hover:bg-lightgray/70 transition-colors"
                                    onClick={() => handleSort("customer")}
                                >
                                    <div className="flex items-center gap-2">
                                        Müşteri
                                        <SortIcon field="customer" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-left text-sm font-bold text-darkgray font-Barlow whitespace-nowrap cursor-pointer hover:bg-lightgray/70 transition-colors"
                                    onClick={() => handleSort("orderDate")}
                                >
                                    <div className="flex items-center gap-2">
                                        Tarih
                                        <SortIcon field="orderDate" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-darkgray font-Barlow whitespace-nowrap">
                                    Ürünler
                                </th>
                                <th
                                    className="px-6 py-4 text-left text-sm font-bold text-darkgray font-Barlow whitespace-nowrap cursor-pointer hover:bg-lightgray/70 transition-colors"
                                    onClick={() => handleSort("totalAmount")}
                                >
                                    <div className="flex items-center gap-2">
                                        Toplam
                                        <SortIcon field="totalAmount" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-darkgray font-Barlow min-w-[160px]">
                                    Ödeme
                                </th>
                                <th
                                    className="px-6 py-4 text-left text-sm font-bold text-darkgray font-Barlow whitespace-nowrap cursor-pointer hover:bg-lightgray/70 transition-colors"
                                    onClick={() => handleSort("orderStatus")}
                                >
                                    <div className="flex items-center gap-2">
                                        Durum
                                        <SortIcon field="orderStatus" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-darkgray font-Barlow whitespace-nowrap">
                                    İşlemler
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedOrders.map((order) => (
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
                                setSortField(field);
                                setSortDirection(direction);
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
                    {sortedOrders.map((order) => (
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
