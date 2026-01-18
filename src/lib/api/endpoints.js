export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/pizza/api";

export const ENDPOINTS = {
    PRODUCTS: '/products',
    CATEGORIES: '/category/simple',
    ORDERS: '/orders',
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        REFRESH: '/auth/refresh',
    },
    ADMIN: {
        STATS: '/admin/stats',
        USERS: '/users',
    }
};
