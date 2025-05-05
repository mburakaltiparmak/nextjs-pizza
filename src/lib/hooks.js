import axios from "axios";
import { useDispatch, useSelector, useStore } from "react-redux";

export const useAppDispatch = useDispatch.withTypes();
export const useAppSelector = useSelector.withTypes();
export const useAppStore = useStore.withTypes();

// API istekleri için sabitler
const API_TIMEOUT = 10000; // 10 saniye
const API_BASE_URL = "https://pizza-backend.fly.dev/pizza/api";
//const API_BASE_URL = "https://pizza-backend.fly.dev/pizza/api";
// Axios instance oluştur - timeout ve yeniden denemeleri ekle
export const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT, // 10 saniye zaman aşımı
});

// Kullanıcı işlemleri için ayrı bir instance
export const userInstance = axios.create({
  baseURL: `${API_BASE_URL}/admin/users`,
  timeout: API_TIMEOUT,
});

// Token'ı otomatik eklemek için interceptor
instance.interceptors.request.use(
  (config) => {
    try {
      // localStorage ve sessionStorage'dan token kontrolü
      let token = localStorage.getItem("token");

      // localStorage'da yoksa sessionStorage'a bak
      if (!token) {
        token = sessionStorage.getItem("token");
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // FormData ile çalışırken Content-Type'ı kaldır
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }

      return config;
    } catch (error) {
      console.error("Request interceptor error:", error);
      return config; // Hata olsa bile isteği bloklamayalım
    }
  },
  (error) => {
    console.error("Request interceptor rejection:", error);
    return Promise.reject(error);
  }
);

// Hata ayıklama için response interceptor - sessiz başarısızlıkları işle
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      // Network hatası veya zaman aşımı
      if (!error.response) {
        console.error("Ağ hatası veya zaman aşımı:", error.message);
        // Sessiz hata işleme - kullanıcıya gösterilmeyecek
        return Promise.reject(new Error("Network Error"));
      }

      // Server error
      if (error.response) {
        console.error(
          `API Hatası [${error.response.status}]:`,
          error.response.data || {}
        );

        // Token süresi doldu veya geçersiz ise (401)
        if (error.response.status === 401) {
          console.log(
            "Token geçersiz veya süresi dolmuş, oturum temizleniyor..."
          );

          try {
            // Token'ları temizle
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            localStorage.removeItem("userEmail");
            sessionStorage.removeItem("userEmail");

            // Axios başlıklarını temizle
            delete instance.defaults.headers.common["Authorization"];
          } catch (cleanupError) {
            console.error("Token temizleme hatası:", cleanupError);
          }

          // Sayfa yönlendirmesi - login sayfasında değilsek
          if (
            typeof window !== "undefined" &&
            !window.location.pathname.includes("/login")
          ) {
            // Sessizce yönlendirme yapma - ürünlerin gösterilmesini engellemeyelim
            // window.location.href = "/login?expired=true";
          }
        }
      }
    } catch (handlerError) {
      console.error("Response error handler error:", handlerError);
    }

    return Promise.reject(error);
  }
);

// Kullanıcı instance'ı için de aynı interceptor'ları ayarla
userInstance.interceptors.request.use(
  (config) => {
    try {
      // localStorage ve sessionStorage'dan token kontrolü
      let token = localStorage.getItem("token");

      // localStorage'da yoksa sessionStorage'a bak
      if (!token) {
        token = sessionStorage.getItem("token");
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // FormData ile çalışırken Content-Type'ı kaldır
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }

      return config;
    } catch (error) {
      console.error("User request interceptor error:", error);
      return config;
    }
  },
  (error) => {
    console.error("User request error:", error);
    return Promise.reject(error);
  }
);

// Kullanıcı instance'ı için response interceptor
userInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      if (!error.response) {
        console.error("User API network error:", error.message);
        return Promise.reject(new Error("Network Error"));
      }

      if (error.response) {
        console.error(
          `User API Error [${error.response.status}]:`,
          error.response.data || {}
        );

        // Token süresi doldu veya geçersiz ise (401)
        if (error.response.status === 401) {
          try {
            // Token'ları temizle
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            localStorage.removeItem("userEmail");
            sessionStorage.removeItem("userEmail");

            // Axios başlıklarını temizle
            delete userInstance.defaults.headers.common["Authorization"];
          } catch (cleanupError) {
            console.error("User token cleanup error:", cleanupError);
          }
        }
      }
    } catch (handlerError) {
      console.error("User response error handler error:", handlerError);
    }

    return Promise.reject(error);
  }
);

// Zaman aşımı ile API isteği yapmak için yardımcı fonksiyon
export const makeApiRequest = async (apiCall, timeout = API_TIMEOUT) => {
  try {
    // Timeout Promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("API request timed out")), timeout)
    );

    // API Promise
    const apiPromise = apiCall();

    // Hangisi önce tamamlanırsa
    return await Promise.race([apiPromise, timeoutPromise]);
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};

// Hata yakalama ve recovery ile API isteği yapan wrapper fonksiyon
export const apiRequestWithRetry = async (
  apiCall,
  maxRetries = 2,
  timeout = API_TIMEOUT
) => {
  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await makeApiRequest(apiCall, timeout);
    } catch (error) {
      lastError = error;

      // Network hatası durumunda yeniden dene
      if (!error.response && attempt < maxRetries) {
        console.log(
          `API isteği başarısız oldu, yeniden deneniyor (${
            attempt + 1
          }/${maxRetries})...`
        );
        // Artan bekleme süresi ile yeniden dene (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, attempt))
        );
        continue;
      }

      // Diğer hatalar veya son deneme başarısız olduysa
      break;
    }
  }

  throw lastError;
};
