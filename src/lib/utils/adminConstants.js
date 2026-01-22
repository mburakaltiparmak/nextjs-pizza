/**
 * Admin Constants
 * Centralized constants for admin panel
 */

// ========================================
// PAGINATION
// ========================================
export const PAGINATION = {
    DEFAULT_PAGE: 0,
    DEFAULT_SIZE: 10,
    SIZE_OPTIONS: [10, 25, 50, 100]
};

// ========================================
// TIMEOUTS
// ========================================
export const TIMEOUTS = {
    API: 5000,
    DEBOUNCE: 500,
    TOAST: 3000,
    POLLING: 30000
};

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
    PENDING: "Beklemede",
    CONFIRMED: "Onaylandı",
    PREPARING: "Hazırlanıyor",
    SHIPPING: "Kargoda",
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

// ========================================
// USER STATUSES
// ========================================
export const USER_STATUS = {
    ALL: "ALL",
    ACTIVE: "ACTIVE",
    PENDING: "PENDING",
    REJECTED: "REJECTED",
    SUSPENDED: "SUSPENDED"
};

export const USER_STATUS_LABELS = {
    ALL: "Tüm Durumlar",
    ACTIVE: "Aktif",
    PENDING: "Onay Bekliyor",
    REJECTED: "Reddedildi",
    SUSPENDED: "Askıya Alındı"
};

export const USER_STATUS_COLORS = {
    ACTIVE: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    REJECTED: "bg-red-100 text-red-800",
    SUSPENDED: "bg-gray-100 text-gray-800"
};

// ========================================
// USER ROLES
// ========================================
export const USER_ROLES = {
    ALL: "ALL",
    ADMIN: "ADMIN",
    PERSONAL: "PERSONAL",
    USER: "USER",
    CUSTOMER: "CUSTOMER",
    GUEST: "GUEST"
};

export const USER_ROLE_LABELS = {
    ALL: "Tüm Roller",
    ADMIN: "Yönetici",
    PERSONAL: "Personel",
    USER: "Kullanıcı",
    CUSTOMER: "Müşteri",
    GUEST: "Misafir"
};

export const USER_ROLE_COLORS = {
    ADMIN: "bg-red-100 text-red-800",
    PERSONAL: "bg-blue-100 text-blue-800",
    USER: "bg-gray-100 text-gray-800",
    CUSTOMER: "bg-green-100 text-green-800",
    GUEST: "bg-gray-50 text-gray-600"
};

// ========================================
// TABLE SORT
// ========================================
export const SORT_DIRECTION = {
    ASC: "asc",
    DESC: "desc"
};

// ========================================
// PAYMENT METHODS
// ========================================
export const PAYMENT_METHOD = {
    CREDIT_CARD: "CREDIT_CARD",
    CASH: "CASH",
    ONLINE: "ONLINE"
};

export const PAYMENT_METHOD_LABELS = {
    CREDIT_CARD: "Kredi Kartı",
    CASH: "Nakit",
    ONLINE: "Online Ödeme"
};

// ========================================
// FILTER DEFAULTS
// ========================================
export const FILTER_DEFAULTS = {
    ALL: "ALL",
    SEARCH_PLACEHOLDER: "Ara...",
    NO_RESULTS: "Sonuç bulunamadı"
};

// ========================================
// BADGE CONFIGURATIONS
// ========================================

// User Status Badge Config
export const USER_STATUS_CONFIG = {
    ACTIVE: {
        label: "Aktif",
        color: "bg-green-100 text-green-800",
        iconName: "Check"
    },
    PENDING: {
        label: "Onay Bekliyor",
        color: "bg-yellow-100 text-yellow-800",
        iconName: "AlertTriangle"
    },
    LOCKED: {
        label: "Kilitli",
        color: "bg-red-100 text-red-800",
        iconName: "X"
    },
    REJECTED: {
        label: "Reddedildi",
        color: "bg-gray-100 text-gray-800",
        iconName: "X"
    },
    SUSPENDED: {
        label: "Askıya Alındı",
        color: "bg-gray-100 text-gray-800",
        iconName: "Ban"
    }
};

// User Role Badge Config
export const USER_ROLE_CONFIG = {
    ADMIN: {
        label: "Admin",
        color: "bg-purple-100 text-purple-800",
        iconName: "Shield"
    },
    PERSONAL: {
        label: "Personel",
        color: "bg-blue-100 text-blue-800",
        iconName: "User"
    },
    USER: {
        label: "Kullanıcı",
        color: "bg-green-100 text-green-800",
        iconName: "User"
    },
    CUSTOMER: {
        label: "Müşteri",
        color: "bg-green-100 text-green-800",
        iconName: "User"
    },
    GUEST: {
        label: "Misafir",
        color: "bg-gray-100 text-gray-800",
        iconName: "User"
    }
};

// Order Status Badge Config
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

// Payment Status Badge Config
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

// Payment Method Display Labels
export const PAYMENT_METHOD_DISPLAY = {
    CASH: "💵 Kapıda Ödeme",
    CREDIT_CARD: "💳 Kredi Kartı",
    ONLINE_CREDIT_CARD: "🌐 Online Kredi Kartı",
    GIFT_CARD: "🎁 Hediye Kartı"
};
