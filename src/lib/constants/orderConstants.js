/**
 * Order & Payment Constants
 * Centralized constants for the entire application (Admin + Public)
 */

// ========================================
// ORDER STATUSES
// ========================================
export const ORDER_STATUS = {
    ALL: "ALL",
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    PREPARING: "PREPARING",
    SHIPPING: "SHIPPING",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED"
};

export const ORDER_STATUS_LABELS = {
    ALL: "Tümü",
    PENDING: "Sipariş Alındı",
    CONFIRMED: "Onaylandı",
    PREPARING: "Hazırlanıyor",
    SHIPPING: "Yolda",
    DELIVERED: "Teslim Edildi",
    CANCELLED: "İptal Edildi"
};

export const ORDER_STATUS_COLORS = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PREPARING: "bg-purple-100 text-purple-800",
    SHIPPING: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800"
};

// Order Status Badge Config (Icon + Color + Label)
export const ORDER_STATUS_CONFIG = {
    PENDING: {
        label: "Beklemede",
        color: "bg-yellow text-white",
        icon: "⏱️"
    },
    CONFIRMED: {
        label: "Onaylandı",
        color: "bg-blue-500 text-white",
        icon: "✓"
    },
    PREPARING: {
        label: "Hazırlanıyor",
        color: "bg-purple-500 text-white",
        icon: "👨‍🍳"
    },
    SHIPPING: {
        label: "Yolda",
        color: "bg-indigo-500 text-white",
        icon: "🚚"
    },
    DELIVERED: {
        label: "Teslim Edildi",
        color: "bg-green-500 text-white",
        icon: "✅"
    },
    CANCELLED: {
        label: "İptal Edildi",
        color: "bg-red text-white",
        icon: "❌"
    }
};

// ========================================
// PAYMENT METHODS
// ========================================
export const PAYMENT_METHOD = {
    CREDIT_CARD: "CREDIT_CARD",
    CASH: "CASH",
    ONLINE: "ONLINE",
    // Adding ONLINE_CREDIT_CARD to match usage in project
    ONLINE_CREDIT_CARD: "ONLINE_CREDIT_CARD",
    GIFT_CARD: "GIFT_CARD"
};

export const PAYMENT_METHOD_LABELS = {
    CREDIT_CARD: "Kredi Kartı",
    CASH: "Nakit",
    ONLINE: "Online Ödeme",
    ONLINE_CREDIT_CARD: "Online Kredi Kartı",
    GIFT_CARD: "Hediye Kartı"
};

export const PAYMENT_METHOD_DISPLAY = {
    CASH: "💵 Kapıda Ödeme",
    CREDIT_CARD: "💳 Kredi Kartı",
    ONLINE_CREDIT_CARD: "🌐 Online Kredi Kartı",
    GIFT_CARD: "🎁 Hediye Kartı"
};

// ========================================
// PAYMENT STATUS
// ========================================
export const PAYMENT_STATUS_CONFIG = {
    PENDING: {
        label: "Beklemede",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300"
    },
    SUCCESS: {
        label: "Ödendi",
        color: "bg-green-100 text-green-800 border-green-300"
    },
    FAILED: {
        label: "Başarısız",
        color: "bg-red-100 text-red-800 border-red-300"
    },
    REFUNDED: {
        label: "İade Edildi",
        color: "bg-gray-100 text-gray-800 border-gray-300"
    }
};

// ========================================
// HELPERS
// ========================================

/**
 * Get display text for order status
 * @param {string} status 
 * @returns {string}
 */
export const getOrderStatusDisplay = (status) => {
    return ORDER_STATUS_LABELS[status] || status || "Bilinmiyor";
};

/**
 * Get config object for order status
 * @param {string} status 
 * @returns {object} { label, color, icon }
 */
export const getOrderStatusConfig = (status) => {
    return ORDER_STATUS_CONFIG[status] || {
        label: status,
        color: "bg-gray-500 text-white",
        icon: "?"
    };
};

/**
 * Get display text for payment method
 * @param {string} method 
 * @returns {string}
 */
export const getPaymentMethodDisplay = (method) => {
    return PAYMENT_METHOD_DISPLAY[method] || PAYMENT_METHOD_LABELS[method] || method || "Belirtilmemiş";
};
