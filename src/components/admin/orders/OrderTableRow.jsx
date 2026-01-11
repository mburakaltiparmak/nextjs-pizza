"use client";

import { Eye, MapPin, User, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge, PaymentStatusBadge, PaymentMethodBadge } from "./OrderStatusBadge";

export const OrderTableRow = ({ order, onViewDetail }) => {
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

    const customerName = order.userName || order.deliveryAddress?.recipientName || "Misafir";
    const customerEmail = order.userEmail || "-";

    return (
        <tr className="border-b border-lightgray2 hover:bg-lightgray/30 transition-colors">
            {/* Order ID */}
            <td className="px-6 py-4">
                <span className="font-semibold text-darkgray font-Barlow">
                    #{order.id}
                </span>
            </td>

            {/* Customer */}
            <td className="px-6 py-4">
                <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                        <p className="font-medium text-darkgray font-Barlow truncate">
                            {customerName}
                        </p>
                        {customerEmail !== "-" && (
                            <p className="text-xs text-gray-500 font-Barlow truncate">
                                {customerEmail}
                            </p>
                        )}
                    </div>
                </div>
            </td>

            {/* Date */}
            <td className="px-6 py-4">
                <span className="text-sm text-gray-700 font-Barlow whitespace-nowrap">
                    {formatDate(order.orderDate)}
                </span>
            </td>

            {/* Items */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700 font-Barlow">
                        {order.items?.length || 0} ürün
                    </span>
                </div>
            </td>

            {/* Total */}
            <td className="px-6 py-4">
                <span className="font-bold text-darkgray font-Barlow">
                    {order.totalAmount?.toFixed(2)} ₺
                </span>
            </td>

            {/* Payment */}
            <td className="px-6 py-4">
                <div className="space-y-1">
                    <PaymentMethodBadge method={order.payment?.paymentMethod} />
                    <div>
                        <PaymentStatusBadge status={order.payment?.paymentStatus} />
                    </div>
                </div>
            </td>

            {/* Status */}
            <td className="px-6 py-4">
                <OrderStatusBadge status={order.orderStatus} />
            </td>

            {/* Actions */}
            <td className="px-6 py-4 text-right">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetail(order.id)}
                    className="border-blue-500 text-blue-600 hover:bg-blue-50 font-Barlow"
                >
                    <Eye size={16} className="mr-1" />
                    Detay
                </Button>
            </td>
        </tr>
    );
};
