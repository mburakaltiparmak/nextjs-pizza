"use client";

import React from "react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { PaymentMethodBadge, OrderStatusBadge } from "@/components/common";

export const SuccessOrderSummary = ({ latestOrder, paymentMethod, calculateTotal }) => {
    
    const renderOrderItems = () => {
        if (latestOrder.items && Array.isArray(latestOrder.items)) {
            return latestOrder.items.map((item, index) => (
                <div
                    key={index}
                    className="flex flex-col justify-start items-start gap-4 font-semibold text-sm "
                >
                    <div className="grid grid-cols-3 items-center w-full">
                        <span className="flex flex-row items-center gap-1">
                            <div className="relative w-12 h-12">
                                <Image
                                    className="object-cover rounded-full"
                                    src={item.product?.img || "/assets/images/fe/pizza-icon.png"}
                                    alt={item.product?.name || "Ürün"}
                                    fill
                                    sizes="48px"
                                />
                            </div>
                            <p className="font-normal"># {item.quantity} </p>
                        </span>
                        <p className="">{item.product?.name || "Ürün"}</p>
                        <p>
                            {item.quantity} x {item.product?.price} TL
                        </p>
                    </div>
                </div>
            ));
        } else if (Array.isArray(latestOrder)) {
            // Fallback for array format
            return latestOrder.map((item, index) => (
                <div key={index} className="">
                    <div className="">
                        <h4 className="font-semibold text-sm">
                            {item.product?.name || "Ürün"}
                        </h4>
                        <span className="text-sm">
                            {item.count} x {item.product?.price} TL
                        </span>
                    </div>
                    <div className="text-sm ">
                        <p>Toplam: {item.count * (item.product?.price || 0)} TL</p>
                    </div>
                </div>
            ));
        }

        return (
            <p className="text-center text-yellow">Sipariş öğeleri bulunamadı.</p>
        );
    };

    const totalAmount = calculateTotal ? calculateTotal() : (latestOrder.totalAmount || 0);

    return (
        <>
            <div className="">{renderOrderItems()}</div>
            <Separator orientation="horizontal" className="bg-red" />

            <div className="flex flex-col gap-2 w-full text-sm">
                <h3 className="font-semibold">Sipariş Özeti</h3>
                <div className="flex flex-col items-start gap-2">
                    <div>
                        <span>Toplam Tutar:</span>
                        <span className="font-bold"> {totalAmount} TL</span>
                    </div>
                    <div className="">
                        <span>Ödeme Yöntemi:</span>
                        <div><PaymentMethodBadge method={paymentMethod} /></div>
                    </div>
                </div>
            </div>
            <Separator orientation="horizontal" className="bg-red" />

            <div className="py-2">
                <div className="">
                    <OrderStatusBadge status={latestOrder.orderStatus} className="text-sm px-4 py-2" />
                </div>
            </div>
        </>
    );
};
