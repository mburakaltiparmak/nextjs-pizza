import axios from "axios";
import { useDispatch, useSelector, useStore } from "react-redux";

export const useAppDispatch = useDispatch.withTypes();
export const useAppSelector = useSelector.withTypes();
export const useAppStore = useStore.withTypes();

const API_TIMEOUT = 15000;
const API_BASE_URL = "http://localhost:8080/pizza/api";

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

userInstance.interceptors.request.use(
  instance.interceptors.request.handlers[0].fulfilled,
  instance.interceptors.request.handlers[0].rejected
);

userInstance.interceptors.response.use(
  instance.interceptors.response.handlers[0].fulfilled,
  instance.interceptors.response.handlers[0].rejected
);

export const API_URL = API_BASE_URL;