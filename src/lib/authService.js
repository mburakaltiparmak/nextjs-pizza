import { supabase } from "./supabase";
import { instance } from "./hooks";

// Önbellekleme için değişkenler
let cachedUserProfile = null;
let cachedUserProfileTimestamp = 0;
let cachedAddresses = null;
let cachedAddressesTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

// Token doğrulama önbelleği
let isTokenValid = false;
let lastTokenValidationTime = 0;
const TOKEN_VALIDATION_INTERVAL = 10 * 60 * 1000; // 10 dakika

export const AuthService = {
  // Token ve kullanıcı verilerini sakla
  storeAuthData: (token, email, rememberMe) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("token", token);
    storage.setItem("userEmail", email);
    localStorage.setItem("rememberMe", rememberMe ? "true" : "false");
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Token önbelleğini güncelle
    if (token) {
      isTokenValid = true;
      lastTokenValidationTime = Date.now();
    }

    return { token, email, rememberMe };
  },

  // Token ve kullanıcı verilerini al
  getStoredAuthData: () => {
    const rememberMe = localStorage.getItem("rememberMe") === "true";
    const storage = rememberMe ? localStorage : sessionStorage;

    return {
      token: storage.getItem("token"),
      email: storage.getItem("userEmail"),
      rememberMe: rememberMe,
    };
  },

  // Email ve şifre ile giriş
  login: async (email, password, rememberMe) => {
    try {
      const response = await instance.post(
        "/auth/login",
        {
          email: email,
          password: password,
        },
        {
          //  timeout: 8000, // 8 saniye timeout
        }
      );

      if (response.data && response.data.token) {
        AuthService.storeAuthData(
          response.data.token,
          response.data.email || email,
          rememberMe
        );
        return response.data;
      }
      throw new Error("Token alınamadı");
    } catch (error) {
      throw error;
    }
  },

  // Supabase ile Google OAuth başlatma
  initiateGoogleLogin: async (rememberMe = true) => {
    // Mevcut URL'i kaydet (geri dönüş için)
    const returnUrl = window.location.pathname;
    localStorage.setItem("authReturnUrl", returnUrl);
    localStorage.setItem("rememberMe", rememberMe ? "true" : "false");

    // Supabase OAuth başlat - callback sayfasına yönlendirecek
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/oauth2/callback`,
      },
    });

    if (error) {
      console.error("Google OAuth başlatma hatası:", error);
      throw error;
    }

    return data;
  },

  // Token doğrulama - önbellek ile optimize edilmiş
  validateToken: async (token, force = false) => {
    // Önbellek kontrolü
    const now = Date.now();
    if (
      !force &&
      isTokenValid &&
      now - lastTokenValidationTime < TOKEN_VALIDATION_INTERVAL
    ) {
      return { valid: true };
    }

    try {
      // Eğer token Supabase'den geliyorsa
      if (token && token.startsWith("sbx_")) {
        // Supabase session kontrolü
        const { data: session } = await supabase.auth.getSession();
        const result = {
          valid: !!session,
          email: session?.user?.email,
          role: "CUSTOMER",
        };

        if (result.valid) {
          isTokenValid = true;
          lastTokenValidationTime = now;
        }

        return result;
      } else {
        // Backend JWT token doğrulama
        const response = await instance.post("/auth/validate-token", null, {
          headers: { Authorization: `Bearer ${token}` },
          //timeout: 5000,
        });

        if (response.data && response.data.valid) {
          isTokenValid = true;
          lastTokenValidationTime = now;
        }

        return response.data;
      }
    } catch (error) {
      isTokenValid = false;
      return { valid: false };
    }
  },

  // Kayıt ol
  register: async (userData) => {
    try {
      const response = await instance.post("/auth/register", userData, {
        //  timeout: 15000, // Kayıt için daha uzun timeout
      });
      return { success: true, data: response.data };
    } catch (error) {
      throw error;
    }
  },

  // Şifre sıfırlama bağlantısı gönder
  forgotPassword: async (email) => {
    try {
      const response = await instance.post(
        "/auth/forgot-password",
        { email },
        {
          //   timeout: 8000,
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      throw error;
    }
  },

  // Email doğrulama
  verifyEmail: async (token) => {
    try {
      const response = await instance.get(`/auth/verify?token=${token}`, {
        //timeout: 8000,
      });
      return { success: true, data: response.data };
    } catch (error) {
      throw error;
    }
  },

  // Kullanıcı profili getir - önbellek ile
  fetchUserProfile: async (forceRefresh = false) => {
    const now = Date.now();
    if (
      !forceRefresh &&
      cachedUserProfile &&
      now - cachedUserProfileTimestamp < CACHE_DURATION
    ) {
      return cachedUserProfile;
    }

    try {
      const response = await instance.get("/user/profile", {
        // timeout: 8000,
      });

      // Önbelleğe al
      cachedUserProfile = response.data;
      cachedUserProfileTimestamp = now;

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Profil güncelle
  updateUserProfile: async (userData) => {
    try {
      const response = await instance.put("/user/profile", userData, {
        // timeout: 8000,
      });

      // Önbelleği temizle
      cachedUserProfile = null;
      cachedUserProfileTimestamp = 0;

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Şifre değiştir
  changePassword: async (passwordData) => {
    try {
      const response = await instance.post("/user/password", passwordData, {
        // timeout: 8000,
      });
      return { success: true, data: response.data };
    } catch (error) {
      throw error;
    }
  },

  // Adresleri getir - önbellek ile
  fetchUserAddresses: async (forceRefresh = false) => {
    const now = Date.now();
    if (
      !forceRefresh &&
      cachedAddresses &&
      now - cachedAddressesTimestamp < CACHE_DURATION
    ) {
      return cachedAddresses;
    }

    try {
      const response = await instance.get("/user/addresses", {
        // timeout: 8000,
      });

      // Önbelleğe al
      cachedAddresses = response.data || [];
      cachedAddressesTimestamp = now;

      return cachedAddresses;
    } catch (error) {
      // Hata durumunda boş liste dön
      return [];
    }
  },

  // Adres ekle
  createAddress: async (addressData) => {
    try {
      const response = await instance.post("/user/addresses", addressData, {
        // timeout: 8000,
      });

      // Adres önbelleğini temizle
      cachedAddresses = null;
      cachedAddressesTimestamp = 0;

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Adres güncelle
  updateAddress: async (addressId, addressData) => {
    try {
      const response = await instance.put(
        `/user/addresses/${addressId}`,
        addressData,
        {
          // timeout: 8000,
        }
      );

      // Adres önbelleğini temizle
      cachedAddresses = null;
      cachedAddressesTimestamp = 0;

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Adres sil
  deleteAddress: async (addressId) => {
    try {
      const response = await instance.delete(`/user/addresses/${addressId}`, {
        // timeout: 8000,
      });

      // Adres önbelleğini temizle
      cachedAddresses = null;
      cachedAddressesTimestamp = 0;

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Önbelleği temizle
  clearCache: () => {
    cachedUserProfile = null;
    cachedUserProfileTimestamp = 0;
    cachedAddresses = null;
    cachedAddressesTimestamp = 0;
    isTokenValid = false;
    lastTokenValidationTime = 0;
  },

  // Oturumu kapat
  logout: async () => {
    try {
      // Önbelleği temizle
      AuthService.clearCache();

      // Supabase oturumunu kapat
      await supabase.auth.signOut();

      // Tüm yerel depolamayı temizle
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userEmail");
      localStorage.removeItem("sb-nslkxjzddnjpouzkevii-auth-token");

      // Axios header'larını temizle
      delete instance.defaults.headers.common["Authorization"];

      return { success: true };
    } catch (error) {
      console.error("Logout hatası:", error);
      return { error: "Çıkış yapılamadı", success: false };
    }
  },
};

// Token ve kullanıcı verilerini sakla - geriye dönük uyumluluk
const storeAuthData = (token, email, rememberMe) => {
  return AuthService.storeAuthData(token, email, rememberMe);
};

// Token ve kullanıcı verilerini al - geriye dönük uyumluluk
export const getStoredAuthData = () => {
  return AuthService.getStoredAuthData();
};
