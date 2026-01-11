"use client";

import { Calendar, MapPin, User, Package, DollarSign, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge, PaymentStatusBadge, PaymentMethodBadge } from "./OrderStatusBadge";

export const OrderMobileCard = ({ order, onViewDetail }) => {
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
    const address = order.deliveryAddress
        ? `${order.deliveryAddress.district}, ${order.deliveryAddress.city}`
        : "-";

    return (
        <div className="bg-white rounded-lg shadow-sm border border-lightgray p-4 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div>
                    <p className="text-sm text-gray-500 font-Barlow">Sipariş No</p>
                    <p className="font-semibold text-darkgray font-Barlow">
                        #{order.id}
                    </p>
                </div>
                <OrderStatusBadge status={order.orderStatus} />
            </div>

            {/* Customer */}
            <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700 font-Barlow">{customerName}</span>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2 mb-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600 font-Barlow line-clamp-1">
                    {address}
                </span>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 font-Barlow">
                    {formatDate(order.orderDate)}
                </span>
            </div>

            {/* Items & Total */}
            <div className="flex items-center justify-between mb-3 pt-3 border-t border-lightgray2">
                <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 font-Barlow">
                        {order.items?.length || 0} ürün
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="font-bold text-darkgray font-Barlow">
                        {order.totalAmount?.toFixed(2)} ₺
                    </span>
                </div>
            </div>

            {/* Payment */}
            <div className="flex items-center justify-between mb-3">
                <PaymentMethodBadge method={order.payment?.paymentMethod} />
                <PaymentStatusBadge status={order.payment?.paymentStatus} />
            </div>

            {/* Action */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetail(order.id)}
                className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 font-Barlow"
            >
                <Eye size={16} className="mr-2" />
                Detayları Görüntüle
            </Button>
        </div>
    );
};
