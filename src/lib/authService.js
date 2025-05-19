import { supabase } from './supabase';
import { instance } from './hooks';

export const AuthService = {
  // Email ve şifre ile giriş - eski yöntem korunuyor
  login: async (email, password, rememberMe) => {
    try {
      const response = await instance.post("/auth/login", {
        email: email,
        password: password
      });
      
      if (response.data && response.data.token) {
        storeAuthData(response.data.token, response.data.email || email, rememberMe);
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
    localStorage.setItem("tempRememberMe", rememberMe ? "true" : "false");
    
    // Supabase OAuth başlat
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/oauth2/callback`
      }
    });
    
    if (error) {
      console.error("Google OAuth başlatma hatası:", error);
      throw error;
    }
    
    return data;
  },

  // Token doğrulama - hem backend JWT hem de Supabase token için
  validateToken: async (token) => {
    try {
      // Eğer token Supabase'den geliyorsa
      if (token.startsWith('sbx_')) {
        // Supabase session kontrolü
        const { data: session } = await supabase.auth.getSession();
        return { 
          valid: !!session, 
          email: session?.user?.email,
          role: 'CUSTOMER' // Varsayılan rol - backend sync sonrası güncellenecek
        };
      } else {
        // Backend JWT token doğrulama
        const response = await instance.post("/auth/validate-token", null, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
      }
    } catch (error) {
      return { valid: false };
    }
  },

  // Oturumu kapat
  logout: async () => {
    try {
      // Supabase oturumunu kapat
      await supabase.auth.signOut();
      
      // Tüm yerel depolamayı temizle
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userEmail");
      
      // Axios header'larını temizle
      delete instance.defaults.headers.common["Authorization"];
      
      return { success: true };
    } catch (error) {
      console.error("Logout hatası:", error);
      return { error: "Çıkış yapılamadı", success: false };
    }
  },
};

// Token ve kullanıcı verilerini sakla
const storeAuthData = (token, email, rememberMe) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem("token", token);
  storage.setItem("userEmail", email);
  localStorage.setItem("rememberMe", rememberMe ? "true" : "false");
  instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

// Token ve kullanıcı verilerini al
export const getStoredAuthData = () => {
  const rememberMe = localStorage.getItem("rememberMe") === "true";
  const storage = rememberMe ? localStorage : sessionStorage;
  
  return {
    token: storage.getItem("token"),
    email: storage.getItem("userEmail"),
    rememberMe: rememberMe
  };
};