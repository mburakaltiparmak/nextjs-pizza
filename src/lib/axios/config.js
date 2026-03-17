import axios from 'axios';
import { getAccessToken, getRefreshToken, clearTokens } from "@/lib/utils/tokenStorage";
import { tokenRefreshManager } from "@/lib/utils/tokenRefreshManager";
import { isTokenExpired } from "@/lib/utils/tokenUtils";

const API_BASE_URL = "https://api.burakaltiparmak.site/pizza/api";

// E-commerce specific timeout strategies
const TIMEOUT_CONFIG = {
    DEFAULT: 15000,      // General requests
    PAYMENT: 30000,      // Payment processing (3D Secure)
    UPLOAD: 60000,       // File uploads
    SEARCH: 5000,        // Search requests
};

// Retry strategy for network errors
const RETRY_CONFIG = {
    retries: 3,
    retryDelay: (retryCount) => {
        return Math.min(1000 * (2 ** retryCount), 10000); // Exponential backoff
    },
    retryCondition: (error) => {
        // Retry only on network errors or 5xx server errors (idempotent methods only ideally, but for now network focus)
        // Avoid retrying 4xx errors as they are client faults
        return !error.response || (error.code === 'ECONNABORTED') || (error.response.status >= 500);
    },
};

// Base configuration
const baseConfig = {
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
};

// 1. Default Instance
export const instance = axios.create({
    ...baseConfig,
    timeout: TIMEOUT_CONFIG.DEFAULT,
});

// 2. Payment Instance (Longer timeout)
export const paymentInstance = axios.create({
    ...baseConfig,
    timeout: TIMEOUT_CONFIG.PAYMENT,
});

// 3. Upload Instance
export const uploadInstance = axios.create({
    ...baseConfig,
    timeout: TIMEOUT_CONFIG.UPLOAD,
});
// Upload usually requires multipart/form-data, but axios handles it if data is FormData.
// We'll keep the interceptor logic that removes Content-Type if FormData is detected.


// --- INTERCEPTORS ---

const setupInterceptors = (axiosInstance) => {
    // REQUEST INTERCEPTOR
    axiosInstance.interceptors.request.use(
        (config) => {
            // Dev logging
            if (process.env.NODE_ENV === "development") {
                console.log(`🔷 API Request (${axiosInstance.defaults.timeout}ms): ${config.method?.toUpperCase()} ${config.url}`);
            }

            // Handle FormData
            if (config.data instanceof FormData) {
                delete config.headers['Content-Type'];
            }

            // Auth Token
            if (typeof window !== "undefined") {
                const token = getAccessToken();
                if (token) {
                    // We could check expiry here, but we'll rely on response interceptor for refresh
                    // to avoid aggressive refreshing before necessary.
                    if (!config.headers.Authorization) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                }
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // RESPONSE INTERCEPTOR
    axiosInstance.interceptors.response.use(
        (response) => {
            if (process.env.NODE_ENV === "development") {
                console.log(`✅ API Response: ${response.status} ${response.config.url}`);
            }
            return response;
        },
        async (error) => {
            const originalRequest = error.config;

            // Dev logging
            if (process.env.NODE_ENV === "development") {
                if (axios.isCancel(error)) {
                    console.log(`⏹️ Request Canceled: ${error.message}`);
                } else if (error.code === "ECONNABORTED") {
                    console.warn(`⏱️ API Timeout: ${error.config?.url}`);
                } else if (!error.response) {
                    console.error(`❌ Network Error: ${error.message}`);
                } else {
                    console.error(`❌ API Error: ${error.response.status} ${error.config?.url}`, error.response.data);
                }
            }

            // 1. Handle 401 Unauthorized (Token Refresh)
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    const refreshToken = getRefreshToken();
                    if (!refreshToken) {
                        throw new Error("No refresh token available");
                    }

                    const accessToken = await tokenRefreshManager.refreshToken(
                        refreshToken,
                        API_BASE_URL
                    );

                    // Update default headers for future requests
                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return axiosInstance(originalRequest);

                } catch (refreshError) {
                    // Refresh failed - logout
                    if (typeof window !== "undefined") {
                        clearTokens();
                        window.location.href = '/login';
                    }
                    return Promise.reject(refreshError);
                }
            }

            // 2. Handle Retries (Network Errors / Timeouts)
            // Skip retry if it was a 401 retry (handled above) or if already retried max times
            if (
                RETRY_CONFIG.retryCondition(error) &&
                (originalRequest._retryCount || 0) < RETRY_CONFIG.retries &&
                !originalRequest._retry // Don't retry if we just tried to refresh token
            ) {
                originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
                const delay = RETRY_CONFIG.retryDelay(originalRequest._retryCount);

                console.log(`🔄 Retrying request... Attempt ${originalRequest._retryCount} in ${delay}ms`);

                await new Promise(resolve => setTimeout(resolve, delay));
                return axiosInstance(originalRequest);
            }

            return Promise.reject(error);
        }
    );
};

// Apply interceptors to all instances
[instance, paymentInstance, uploadInstance].forEach(setupInterceptors);

export const API_URL = API_BASE_URL;
