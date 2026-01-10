import axios from "axios";
import { isTokenExpired } from "@/lib/utils/tokenUtils";
import { getAccessToken, getRefreshToken, clearTokens } from "@/lib/utils/tokenStorage";
import { tokenRefreshManager } from "@/lib/utils/tokenRefreshManager";
import { API_BASE_URL } from "./endpoints";

const API_TIMEOUT = 30000; // Problem #13: Increased timeout and made it consistent

export const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

instance.interceptors.request.use(
    (config) => {
        // Development logging
        if (process.env.NODE_ENV === "development") {
            console.log(`🔷 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }

        // Problem #14: Consistent FormData handling
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
            if (process.env.NODE_ENV === "development") {
                console.log("🔍 FormData detected, removing Content-Type header");
            }
        }

        // Add auth token if exists
        if (typeof window !== "undefined") {
            const token = getAccessToken();

            if (token) {
                // Token expiration check (logging only for now as per original implementation)
                if (isTokenExpired(token)) {
                    console.log('Token expired, refreshing before request...');
                }

                if (!config.headers.Authorization) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

instance.interceptors.response.use(
    (response) => {
        if (process.env.NODE_ENV === "development") {
            console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Error logging
        if (process.env.NODE_ENV === "development") {
            if (error.name === "AbortError" || error.name === "CanceledError") {
                console.log(`🚫 API Request Cancelled: ${error.config?.url}`);
            } else if (error.code === "ECONNABORTED") {
                console.warn(`⏱️ API Timeout: ${error.config?.url} - ${API_TIMEOUT}ms`);
            } else {
                console.error(
                    `❌ API Error: ${error.config?.url}`,
                    error.response?.data || error.message
                );
            }
        }

        // Refresh token logic
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = getRefreshToken();

            if (!refreshToken) {
                if (typeof window !== "undefined") {
                    clearTokens();
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            try {
                const accessToken = await tokenRefreshManager.refreshToken(
                    refreshToken,
                    API_BASE_URL
                );

                instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return instance(originalRequest);
            } catch (refreshError) {
                if (typeof window !== "undefined") {
                    clearTokens();
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);
