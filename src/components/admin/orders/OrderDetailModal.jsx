"use client";

import Image from "next/image";
import { X, User, MapPin, Package, Calendar, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OrderStatusBadge, PaymentStatusBadge, PaymentMethodBadge } from "./OrderStatusBadge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export const OrderDetailModal = ({
    open,
    onClose,
    order,
    onUpdateStatus,
    isUpdating
}) => {
    if (!order) return null;

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
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex justify-between items-center">
                        <span className="font-Barlow text-darkgray">
                            Sipariş Detayı #{order.id}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-8 w-8 p-0"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </AlertDialogTitle>
                </AlertDialogHeader>

                <div className="space-y-6 font-Barlow">
                    {/* Status & Payment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-lightgray/30 rounded-lg p-4 border border-lightgray2">
                            <p className="text-sm text-gray-600 mb-2 font-Barlow">
                                Sipariş Durumu
                            </p>
                            <Select
                                value={order.orderStatus}
                                onValueChange={(newStatus) => onUpdateStatus(order.id, newStatus)}
                                disabled={isUpdating}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">Beklemede</SelectItem>
                                    <SelectItem value="CONFIRMED">Onaylandı</SelectItem>
                                    <SelectItem value="PREPARING">Hazırlanıyor</SelectItem>
                                    <SelectItem value="SHIPPING">Yolda</SelectItem>
                                    <SelectItem value="DELIVERED">Teslim Edildi</SelectItem>
                                    <SelectItem value="CANCELLED">İptal Edildi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="bg-lightgray/30 rounded-lg p-4 border border-lightgray2">
                            <p className="text-sm text-gray-600 mb-2 font-Barlow">
                                Ödeme Bilgileri
                            </p>
                            <div className="space-y-2">
                                <PaymentMethodBadge method={order.payment?.paymentMethod} />
                                <div>
                                    <PaymentStatusBadge status={order.payment?.paymentStatus} />
                                </div>
                                {order.payment?.transactionId && (
                                    <p className="text-xs text-gray-500">
                                        İşlem No: {order.payment.transactionId}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-lightgray/30 rounded-lg p-4 border border-lightgray2">
                        <h3 className="font-semibold text-darkgray mb-3 flex items-center gap-2 font-Barlow">
                            <User className="w-5 h-5" />
                            Müşteri Bilgileri
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-600">Ad Soyad:</span>{" "}
                                <span className="font-medium text-darkgray">{customerName}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">E-posta:</span>{" "}
                                <span className="font-medium text-darkgray">{customerEmail}</span>
                            </div>
                            {order.deliveryAddress?.phoneNumber && (
                                <div className="flex items-center gap-1">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Telefon:</span>{" "}
                                    <span className="font-medium text-darkgray">
                                        {order.deliveryAddress.phoneNumber}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Delivery Address */}
                    {order.deliveryAddress && (
                        <div className="bg-lightgray/30 rounded-lg p-4 border border-lightgray2">
                            <h3 className="font-semibold text-darkgray mb-3 flex items-center gap-2 font-Barlow">
                                <MapPin className="w-5 h-5" />
                                Teslimat Adresi
                            </h3>
                            <div className="space-y-1 text-sm text-gray-700">
                                {order.deliveryAddress.addressTitle && (
                                    <p className="font-medium text-darkgray">
                                        {order.deliveryAddress.addressTitle}
                                    </p>
                                )}
                                <p>{order.deliveryAddress.fullAddress}</p>
                                <p>
                                    {order.deliveryAddress.district}, {order.deliveryAddress.city}
                                </p>
                                {order.deliveryAddress.postalCode && (
                                    <p>Posta Kodu: {order.deliveryAddress.postalCode}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="bg-lightgray/30 rounded-lg p-4 border border-lightgray2">
                        <h3 className="font-semibold text-darkgray mb-3 flex items-center gap-2 font-Barlow">
                            <Package className="w-5 h-5" />
                            Sipariş İçeriği ({order.items?.length || 0} ürün)
                        </h3>
                        <div className="space-y-3">
                            {order.items?.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-lg p-3 flex items-center gap-3 border border-lightgray2"
                                >
                                    {item.productImage && (
                                        <Image
                                            src={item.productImage}
                                            alt={item.productName}
                                            width={60}
                                            height={60}
                                            className="rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-darkgray">
                                            {item.productName}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {item.quantity} x {item.price?.toFixed(2)} ₺
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-darkgray">
                                            {item.subtotal?.toFixed(2)} ₺
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                            <p className="text-sm font-medium text-yellow-900 mb-1 font-Barlow">
                                📝 Sipariş Notu
                            </p>
                            <p className="text-sm text-yellow-800">{order.notes}</p>
                        </div>
                    )}

                    {/* Totals */}
                    <div className="bg-lightgray/30 rounded-lg p-4 border border-lightgray2">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Ara Toplam</span>
                                <span className="font-medium text-darkgray">
                                    {order.totalAmount?.toFixed(2)} ₺
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Teslimat</span>
                                <span className="font-medium text-darkgray">Ücretsiz</span>
                            </div>
                            <div className="border-t border-lightgray2 pt-2 flex justify-between">
                                <span className="font-semibold text-darkgray font-Barlow">
                                    Toplam
                                </span>
                                <span className="font-bold text-lg text-red">
                                    {order.totalAmount?.toFixed(2)} ₺
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Sipariş Tarihi: {formatDate(order.orderDate)}</span>
                        </div>
                        {order.payment?.completedAt && (
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>Ödeme: {formatDate(order.payment.completedAt)}</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end pt-4 border-t border-lightgray2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="font-Barlow"
                        >
                            Kapat
                        </Button>
                    </div>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
};
