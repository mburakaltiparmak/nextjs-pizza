import axios from "axios";
import { useDispatch, useSelector, useStore } from "react-redux";

export const useAppDispatch = useDispatch.withTypes();
export const useAppSelector = useSelector.withTypes();
export const useAppStore = useStore.withTypes();

// API URL'sini ortama göre belirle
const getBaseUrl = () => {
  if (process.env.NODE_ENV === "development") {
    return "https://pizza-backend.fly.dev/pizza/api";
  }

  if (typeof window !== "undefined") {
    const host = window.location.origin;
    return `${host}/pizza/api`;
  }

  return "/pizza/api";
};

// API istekleri için sabitler - timeout azaltıldı
const API_TIMEOUT = 10000; // 10 saniye - 30 saniyeden düşürüldü
const API_BASE_URL = getBaseUrl();

// Axios instance oluştur - timeout ve optimizasyonlar ekle
export const instance = axios.create({
  baseURL: API_BASE_URL,
  //timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Kullanıcı işlemleri için ayrı bir instance
export const userInstance = axios.create({
  baseURL: `${API_BASE_URL}/admin/users`,
  //timeout: API_TIMEOUT,
});

// Request interceptor - otomatik token ekleme
instance.interceptors.request.use(
  (config) => {
    // Development'ta log
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🔷 API İsteği: ${config.method?.toUpperCase()} ${config.url}`
      );
    }

    // Token'ı otomatik ekle
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
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

// Response interceptor - hata yakalama
instance.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ API Yanıtı: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
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

    return Promise.reject(error);
  }
);

// userInstance için aynı interceptor'ları uygula
userInstance.interceptors.request.use(
  instance.interceptors.request.handlers[0].fulfilled,
  instance.interceptors.request.handlers[0].rejected
);

userInstance.interceptors.response.use(
  instance.interceptors.response.handlers[0].fulfilled,
  instance.interceptors.response.handlers[0].rejected
);

export const API_URL = API_BASE_URL;
