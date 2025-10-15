"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  checkAuthStatus,
  fetchUserAddresses,
  logout,
  setEmail,
  setToken,
  setIsLogin,
  setUserProfile,
  setUserRole,
  setUserStatus,
} from "@/lib/store/actions/userActions";
import { getSafeErrorMessage } from "@/lib/authErrorMessages";
import { createDebouncedRequest } from "@/lib/utils/asyncUtils";
// Supabase importları
import { supabase, syncSupabaseUser } from "@/lib/supabase";
// Yeni utility fonksiyonlarını import et
import {
  configureAuthHeaders,
  enhancedSyncSupabaseUser,
  extractSupabaseToken,
  syncSupabaseTokenToSystem,
} from "@/lib/supabaseSync";
import { initializeAuth } from "@/lib/store/actions/initAuth";
import { initializeCart } from "@/lib/store/actions/orderActions";

// Auth context oluşturma
export const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * @param {object} props - React props
 * @param {React.ReactNode} props.children - Child components
 */
export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState(0);
  const initialCheckDone = useRef(false);
  const authInProgress = useRef(false);
  const mountedRef = useRef(true);
  const storeInitializedRef = useRef(false); // ✅ YENİ: Store initialization kontrolü

  // Redux state'inden kullanıcı bilgilerini al
  const isLogin = useSelector((state) => state.user.isLogin);
  const user = useSelector((state) => state.user.profile);
  const role = useSelector((state) => state.user.role);
  const addresses = useSelector((state) => state.user.addresses);
  const error = useSelector((state) => state.user.error);
  const token = useSelector((state) => state.user.token);

useEffect(() => {
  if (!storeInitializedRef.current && typeof window !== "undefined") {
    const initStore = async () => {
      storeInitializedRef.current = true;
      console.log("🔄 Store initialization başlatıldı...");
      
      try {
        await dispatch(initializeAuth());
        await dispatch(initializeCart());
        console.log("✅ Store initialization tamamlandı");
      } catch (error) {
        console.error("❌ Store initialization hatası:", error);
      }
    };
    
    initStore();
  }
}, [dispatch]);

  // Component unmount olduğunda işaretlemek için
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Supabase Auth Listener - Token senkronizasyonu eklendi
  useEffect(() => {
    // Eğer component unmount olduysa hiçbir şey yapma
    if (!mountedRef.current) return;

    // Önce mevcut Supabase token'ını kontrol et ve sisteme senkronize et
    syncSupabaseTokenToSystem();

    // Supabase auth değişikliklerini dinle
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Supabase auth durumu değişti:", event);

      if (!mountedRef.current) return;

      if (event === "SIGNED_IN" && session) {
        try {
          setLoading(true);

          // Supabase token'ını sistem token'ına da senkronize et
          const rememberMe = localStorage.getItem("rememberMe") === "true";
          const storage = rememberMe ? localStorage : sessionStorage;

          // Token'ı kaydet
          const supabaseToken = session.access_token;
          storage.setItem("token", supabaseToken);

          // Kullanıcı bilgilerini güncelle
          await enhancedSyncSupabaseUser(session, dispatch);

          console.log("Kullanıcı bilgileri senkronize edildi");
        } catch (error) {
          console.error("Auth senkronizasyon hatası:", error);
        } finally {
          if (mountedRef.current) {
            setLoading(false);
          }
        }
      }

      if (event === "SIGNED_OUT") {
        console.log("Kullanıcı çıkış yaptı, state temizleniyor");
        if (mountedRef.current) {
          dispatch(logout());
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  // Google OAuth başlatma
  const initiateGoogleLogin = useCallback(async () => {
    try {
      // Geri dönüş URL'ini kaydet
      const returnUrl = window.location.pathname || "/";
      localStorage.setItem("authReturnUrl", returnUrl);

      // "Beni hatırla" tercihini kaydet
      const rememberMe = true; // Google login'de varsayılan olarak true
      localStorage.setItem("rememberMe", rememberMe ? "true" : "false");

      // Supabase OAuth başlat - callback sayfasına yönlendirecek
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/oauth2/callback`,
        },
      });

      return true;
    } catch (error) {
      console.error("Google OAuth başlatma hatası:", error);
      throw error;
    }
  }, []);

  // Auth kontrolü
  const checkAuth = useCallback(
    async (force = false) => {
      // Çok sık kontrol önleme
      const now = Date.now();
      if (!force && now - lastCheck < 5000) {
        return;
      }

      // Çoklu kontrol önleme
      if (authInProgress.current) {
        return;
      }

      try {
        authInProgress.current = true;
        setLastCheck(now);

        const result = await dispatch(checkAuthStatus());

        if (result && mountedRef.current) {
          // Başarılı auth sonrası adresleri getir
          if (result.isLogin) {
            await dispatch(fetchUserAddresses());
          }
        }

        return result;
      } catch (error) {
        console.error("Auth kontrolü hatası:", error);
      } finally {
        authInProgress.current = false;
      }
    },
    [dispatch, lastCheck]
  );

  // İlk yükleme kontrolü
  useEffect(() => {
    if (!initialCheckDone.current) {
      initialCheckDone.current = true;

      const initAuth = async () => {
        // Store initialization tamamlandıktan sonra auth kontrolü
        if (storeInitializedRef.current) {
          await checkAuth();
        }
      };

      // Store init'in bitmesini bekle
      setTimeout(() => {
        initAuth();
      }, 100);
    }
  }, [checkAuth]);

  // Periyodik yenileme
  useEffect(() => {
    if (!isLogin || !token) return;

    const interval = setInterval(() => {
      checkAuth();
    }, 15 * 60 * 1000); // 15 dakikada bir

    return () => clearInterval(interval);
  }, [isLogin, token, checkAuth]);

  // Debounced yenileme fonksiyonu
  const debouncedAuthCheck = useCallback(
    createDebouncedRequest((force = false) => checkAuth(force), 2000),
    [checkAuth]
  );

  // Dışa açık refreshAuth fonksiyonu
  const refreshAuth = useCallback(() => {
    console.log("refreshAuth çağrıldı");
    return debouncedAuthCheck(true);
  }, [debouncedAuthCheck]);

  // Varsayılan adres getir
  const getDefaultAddress = useCallback(() => {
    if (!addresses || addresses.length === 0) return null;
    return addresses.find((address) => address.isDefault) || addresses[0];
  }, [addresses]);

  // Güvenli hata mesajı getir
  const getErrorMessage = useCallback(
    (err) => {
      return getSafeErrorMessage(err || error);
    },
    [error]
  );

  // Logout handler
  const handleLogout = useCallback(async () => {
    try {
      // Önce Supabase oturumunu kapat
      await supabase.auth.signOut();

      // Sonra Redux store'u temizle
      await dispatch(logout());

      // Supabase localStorage token'ını da manuel olarak temizle
      localStorage.removeItem("sb-nslkxjzddnjpouzkevii-auth-token");

      router.push("/login");
    } catch (error) {
      console.error("Çıkış yapma hatası:", error);
    }
  }, [dispatch, router]);

  // Role göre yetki kontrolü
  const isAuthorized = useCallback(
    (allowedRoles = []) => {
      if (!isLogin) return false;
      if (allowedRoles.length === 0) return true;
      return allowedRoles.includes(role);
    },
    [isLogin, role]
  );

  // Context değeri
  const contextValue = {
    isAuthenticated: isLogin,
    user,
    role,
    loading,
    error,
    addresses,
    token,
    getDefaultAddress,
    getErrorMessage,
    refreshAuth,
    logout: handleLogout,
    isAuthorized,
    checkAuth,
    googleLogin: initiateGoogleLogin,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// useAuthContext hook
export const useAuthContext = (
  allowedRoles = [],
  redirectPath = "/",
  requireAuth = true
) => {
  const context = useContext(AuthContext);
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  if (!context) {
    throw new Error("useAuthContext hook must be used within an AuthProvider");
  }

  // Auth yönlendirme kontrolü
  useEffect(() => {
    if (hasCheckedAuth.current) return;
    if (context.loading) return;

    const checkPermissions = async () => {
      hasCheckedAuth.current = true;

      if (requireAuth && !context.isAuthenticated) {
        router.push("/login");
        return;
      }

      if (allowedRoles.length > 0 && !context.isAuthorized(allowedRoles)) {
        router.push(redirectPath);
        return;
      }
    };

    checkPermissions();
  }, [
    context.isAuthenticated,
    context.role,
    context.loading,
    router,
    allowedRoles,
    redirectPath,
    requireAuth,
    context.isAuthorized,
  ]);

  return {
    ...context,
    isAuthorized:
      !requireAuth ||
      (context.isAuthenticated &&
        (allowedRoles.length === 0 || context.isAuthorized(allowedRoles))),
  };
};

// Basitleştirilmiş useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth hook must be used within an AuthProvider");
  }

  return {
    isAuthenticated: context.isAuthenticated,
    loading: context.loading,
    user: context.user,
    role: context.role,
    refreshAuth: context.refreshAuth,
    logout: context.logout,
    googleLogin: context.googleLogin,
  };
};

export default useAuthContext;