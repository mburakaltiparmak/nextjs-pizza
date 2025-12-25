import axios from "axios";
import { useDispatch, useSelector, useStore } from "react-redux";

export const useAppDispatch = useDispatch.withTypes();
export const useAppSelector = useSelector.withTypes();
export const useAppStore = useStore.withTypes();

const API_TIMEOUT = 15000;
const API_BASE_URL = "https://api.burakaltiparmak.site/pizza/api";

export const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
});

export const userInstance = axios.create({
  baseURL: `${API_BASE_URL}/admin/users`,
  timeout: API_TIMEOUT,
});

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
      const token =
        localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - refresh token desteği ile
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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
      if (isRefreshing) {
        // Zaten token yenileme işlemi devam ediyorsa kuyruğa ekle
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const rememberMe = localStorage.getItem("rememberMe") === "true";
      const storage = rememberMe ? localStorage : sessionStorage;
      const refreshToken = storage.getItem("refreshToken");

      if (!refreshToken) {
        // Refresh token yoksa logout
        isRefreshing = false;
        if (typeof window !== "undefined") {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        // Refresh token ile yeni access token al
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { accessToken } = response.data;

        // Yeni token'ı kaydet
        storage.setItem("accessToken", accessToken);
        instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        // Kuyrukta bekleyen istekleri işle
        processQueue(null, accessToken);

        // Orijinal isteği yeni token ile tekrar dene
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        // Refresh token süresi dolmuş, logout
        processQueue(refreshError, null);
        if (typeof window !== "undefined") {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

userInstance.interceptors.request.use(
  instance.interceptors.request.handlers[0].fulfilled,
  instance.interceptors.request.handlers[0].rejected
);

userInstance.interceptors.response.use(
  instance.interceptors.response.handlers[0].fulfilled,
  instance.interceptors.response.handlers[0].rejected
);

export const API_URL = API_BASE_URL;