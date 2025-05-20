import axios from "axios";
import { useDispatch, useSelector, useStore } from "react-redux";

export const useAppDispatch = useDispatch.withTypes();
export const useAppSelector = useSelector.withTypes();
export const useAppStore = useStore.withTypes();

// API istekleri için sabitler
const API_TIMEOUT = 30000; 
const API_BASE_URL = "https://pizza-backend.fly.dev/pizza/api"; // Düzeltildi - sonunda '/' olmadan

// Axios instance oluştur - timeout ve yeniden denemeleri ekle
export const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT, // 30 saniye zaman aşımı
});

// Kullanıcı işlemleri için ayrı bir instance
export const userInstance = axios.create({
  baseURL: `${API_BASE_URL}/admin/users`,
  timeout: API_TIMEOUT,
});
