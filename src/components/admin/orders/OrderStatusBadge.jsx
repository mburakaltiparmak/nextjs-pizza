"use client";

export const OrderStatusBadge = ({ status }) => {
    const statusConfig = {
        PENDING: {
            color: "bg-yellow text-white",
            text: "Beklemede",
            icon: "⏱️"
        },
        CONFIRMED: {
            color: "bg-blue-500 text-white",
            text: "Onaylandı",
            icon: "✓"
        },
        PREPARING: {
            color: "bg-purple-500 text-white",
            text: "Hazırlanıyor",
            icon: "👨‍🍳"
        },
        SHIPPING: {
            color: "bg-indigo-500 text-white",
            text: "Yolda",
            icon: "🚚"
        },
        DELIVERED: {
            color: "bg-green-500 text-white",
            text: "Teslim Edildi",
            icon: "✅"
        },
        CANCELLED: {
            color: "bg-red text-white",
            text: "İptal Edildi",
            icon: "❌"
        },
    };

    const config = statusConfig[status] || {
        color: "bg-gray-500 text-white",
        text: status,
        icon: "•"
    };

    return (
        <span className={`${config.color} text-xs px-4 py-2 rounded-full font-medium flex items-center justify-center gap-1`}>
            <span>{config.icon}</span>
            <span className="">{config.text}</span>
        </span>
    );
};

export const PaymentStatusBadge = ({ status }) => {
    const statusConfig = {
        PENDING: {
            color: "bg-yellow-100 text-yellow-800 border-yellow-300",
            text: "Beklemede"
        },
        SUCCESS: {
            color: "bg-green-100 text-green-800 border-green-300",
            text: "Ödendi"
        },
        FAILED: {
            color: "bg-red-100 text-red-800 border-red-300",
            text: "Başarısız"
        },
        REFUNDED: {
            color: "bg-gray-100 text-gray-800 border-gray-300",
            text: "İade Edildi"
        },
    };

    const config = statusConfig[status] || {
        color: "bg-gray-100 text-gray-800 border-gray-300",
        text: status
    };

    return (
        <span className={`${config.color} text-xs px-2 py-0.5 rounded border font-medium`}>
            {config.text}
        </span>
    );
};

export const PaymentMethodBadge = ({ method }) => {
    const methodText = {
        CASH: "💵 Kapıda Ödeme",
        CREDIT_CARD: "💳 Kredi Kartı",
        ONLINE_CREDIT_CARD: "🌐 Online Kredi Kartı",
        GIFT_CARD: "🎁 Hediye Kartı",
    };

    return (
        <span className="text-sm text-gray-700 font-Barlow">
            {methodText[method] || method}
        </span>
    );
};
