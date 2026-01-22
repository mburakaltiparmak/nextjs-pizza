"use client";

import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, PAYMENT_METHOD_DISPLAY } from "@/lib/utils/adminConstants";

export const OrderStatusBadge = ({ status }) => {
    const config = ORDER_STATUS_CONFIG[status] || {
        color: "bg-gray-500 text-white",
        label: status,
        icon: "•"
    };

    return (
        <span className={`${config.color} text-xs px-4 py-2 rounded-full font-medium flex items-center justify-center gap-1`}>
            <span>{config.icon}</span>
            <span>{config.label}</span>
        </span>
    );
};

export const PaymentStatusBadge = ({ status }) => {
    const config = PAYMENT_STATUS_CONFIG[status] || {
        color: "bg-gray-100 text-gray-800 border-gray-300",
        label: status
    };

    return (
        <span className={`${config.color} text-xs px-2 py-0.5 rounded border font-medium`}>
            {config.label}
        </span>
    );
};

export const PaymentMethodBadge = ({ method }) => {
    return (
        <span className="text-sm text-gray-700 font-Barlow">
            {PAYMENT_METHOD_DISPLAY[method] || method}
        </span>
    );
};
