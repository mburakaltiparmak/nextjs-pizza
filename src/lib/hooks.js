import axios from "axios";
import { useDispatch, useSelector, useStore } from "react-redux";

export const useAppDispatch = useDispatch.withTypes();
export const useAppSelector = useSelector.withTypes();
export const useAppStore = useStore.withTypes();

export const instance = axios.create({
  baseURL: "http://localhost:9000/pizza/api",
  timeout: 30000, // 30 saniye
});

// Token'ı otomatik eklemek için interceptor
instance.interceptors.request.use(
  (config) => {
    // localStorage'dan token al
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // FormData ile çalışırken Content-Type'ı kaldır
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Hata ayıklama için response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        `API Hatası [${error.response.status}]:`,
        error.response.data
      );
    } else if (error.request) {
      console.error("Yanıt alınamadı:", error.request);
    } else {
      console.error("İstek hatası:", error.message);
    }
    return Promise.reject(error);
  }
);
