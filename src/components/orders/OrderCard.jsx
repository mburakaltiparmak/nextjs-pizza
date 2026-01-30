"use client";

import React from "react";
import Image from "next/image";
import { OrderStatusBadge, PaymentMethodBadge, AddressCard } from "@/components/common";
import { PAYMENT_STATUS_CONFIG } from "@/lib/constants";
import { formatOrderDate } from "@/lib/utils/dateUtils";

export const OrderCard = ({ order }) => {
    return (
        <div className="border border-gray rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gray-50 p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h3 className="font-semibold text-darkgray">
                        Sipariş #{order.id}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString('tr-TR') : formatOrderDate(order.orderDate)}
                    </p>
                </div>

                <div className="mt-2 md:mt-0 flex items-center space-x-2">
                    {order.orderStatus && (
                        <OrderStatusBadge status={order.orderStatus} />
                    )}
                </div>
            </div>

            <div className="p-4">
                {/* Teslimat Adresi */}
                {order.deliveryAddress && (
                    <div className="mb-4">
                        <h4 className="font-semibold text-sm text-darkgray mb-2">Teslimat Adresi</h4>
                        <AddressCard address={order.deliveryAddress} />
                    </div>
                )}

                {/* Sipariş Özeti */}
                <div className="mb-4">
                    <div className="flex justify-between">
                        <span className="text-gray-700 font-medium">Toplam Tutar:</span>
                        <span className="font-bold text-darkgray">{order.totalAmount} TL</span>
                    </div>

                    <div className="flex justify-between mt-1">
                        <span className="text-gray-700 font-medium">Ödeme Yöntemi:</span>
                        <div className="text-darkgray">
                            {order.payment ? (
                                <PaymentMethodBadge method={order.payment.paymentMethod} />
                            ) : "Belirtilmemiş"}
                        </div>
                    </div>

                    <div className="flex justify-between mt-1">
                        <span className="text-gray-700 font-medium">Ödeme Durumu:</span>
                        <span className={`px-2 py-0.5 rounded-full text-white text-xs ${PAYMENT_STATUS_CONFIG[order.payment?.paymentStatus]?.color || "bg-gray-400"}`}>
                            {order.payment ? (PAYMENT_STATUS_CONFIG[order.payment.paymentStatus]?.label || order.payment.paymentStatus) : "Belirtilmemiş"}
                        </span>
                    </div>
                </div>

                {/* Sipariş İçeriği */}
                <div className="mt-2 border-t border-gray-200 pt-3">
                    <div className="text-sm text-gray-700 mb-2 font-medium">Sipariş İçeriği:</div>
                    <ul className="space-y-1">
                        {order.items && order.items.map((item, index) => (
                            <li key={index} className="text-sm flex justify-between items-center">
                                <div className="flex items-center">
                                    {item.product?.img && (
                                        <div className="relative w-8 h-8 mr-2 flex-shrink-0">
                                            <Image
                                                src={item.product.img}
                                                alt={item.product?.name || "Ürün"}
                                                fill
                                                sizes="32px"
                                                className="object-cover rounded-full"
                                            />
                                        </div>
                                    )}
                                    <span>
                                        {item.quantity}x {item.product?.name || "Ürün"}
                                    </span>
                                </div>
                                <span className="font-medium">{item.price} TL</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Siparişe Not */}
                {order.notes && (
                    <div className="mt-3 border-t border-gray-200 pt-3">
                        <div className="text-sm text-gray-700 mb-1 font-medium">Sipariş Notu:</div>
                        <p className="text-sm text-gray-600 italic">{order.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
