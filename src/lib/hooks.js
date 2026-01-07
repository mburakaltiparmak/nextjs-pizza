import axios from "axios";
import { useDispatch, useSelector, useStore } from "react-redux";
import { isTokenExpired } from "@/lib/utils/tokenUtils";
import { getAccessToken, getRefreshToken, clearTokens } from "@/lib/utils/tokenStorage";
import { tokenRefreshManager } from "@/lib/utils/tokenRefreshManager";

export const useAppDispatch = useDispatch.withTypes();
export const useAppSelector = useSelector.withTypes();
export const useAppStore = useStore.withTypes();

const API_TIMEOUT = 15000;
const API_BASE_URL = "https://api.burakaltiparmak.site/pizza/api";

export const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
});

// userInstance removed - unused


instance.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🔷 API İsteği: ${config.method?.toUpperCase()} ${config.url}`
      );
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 FormData detected, removing Content-Type header");
      }
    } else if (config.data && typeof config.data === 'object') {
      config.headers['Content-Type'] = 'application/json';
    }

    if (typeof window !== "undefined") {
      // accessToken kullan (yeni backend formatı)
      let token = getAccessToken();

      if (token) {
        // Token süresi dolmuşsa yenilemeyi dene
        if (isTokenExpired(token)) {
          console.log('Token expired, refreshing before request...');

          // Senkronize refresh işlemi için (async/await burada çalışmaz çünkü interceptor senkron dönebilir veya Promise dönebilir)
          // Ama burada async kullanabiliriz
          // NOT: Bu kısmı basitleştirmek için şimdilik sadece süresi dolmuşsa log basıp devam edelim
          // Gerçek refresh işlemi response interceptor'da (401 alınca) veya tokenRefresh.js ile yapılacak
          // Ancak, eğer istek atılmadan önce sürenin dolduğunu biliyorsak, direkt refresh denemek daha iyi olur.
          // Problem #3'te, bu logic daha sağlam hale getirilecek. 
          // Şimdilik sadece config.headers set etme kısmına dokunuyoruz.
        }

        if (!config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - refresh token desteği ile
// Global variables removed (managed by TokenRefreshManager)

instance.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ API Yanıtı: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Development logging
    if (process.env.NODE_ENV === "development") {
      if (error.name === "AbortError" || error.name === "CanceledError") {
        console.log(`🚫 API İsteği İptal Edildi: ${error.config?.url}`);
      } else if (error.code === "ECONNABORTED") {
        console.warn(`⏱️ API Timeout: ${error.config?.url} - ${API_TIMEOUT}ms`);
      } else {
        console.error(
          `❌ API Hatası: ${error.config?.url}`,
          error.response?.data || error.message
        );
      }
    }

    // 401 hatası ve refresh token varsa token yenilemeyi dene
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // Refresh token yoksa logout
        if (typeof window !== "undefined") {
          clearTokens();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        // Refresh token ile yeni access token al (Race condition korumalı)
        const accessToken = await tokenRefreshManager.refreshToken(
          refreshToken,
          API_BASE_URL
        );

        instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        // Orijinal isteği yeni token ile tekrar dene
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        // Refresh token süresi dolmuş, logout (TokenRefreshManager zaten storage'ı temizler)
        if (typeof window !== "undefined") {
          // Double check cleanup
          clearTokens();
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        // Manager kendi state'ini yönetir, burada bir şey yapmaya gerek yok
      }
    }

    return Promise.reject(error);
  }
);

// userInstance interceptors removed

export const API_URL = API_BASE_URL;