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
} from "@/lib/store/actions/userActions";
import { getSafeErrorMessage } from "@/lib/authErrorMessages";
import { createDebouncedRequest } from "@/lib/utils/asyncUtils";

// Auth context oluşturma
const AuthContext = createContext(null);

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

  // Redux state'inden kullanıcı bilgilerini al
  const isLogin = useSelector((state) => state.user.isLogin);
  const user = useSelector((state) => state.user.profile);
  const role = useSelector((state) => state.user.role);
  const addresses = useSelector((state) => state.user.addresses);
  const error = useSelector((state) => state.user.error);
  const token = useSelector((state) => state.user.token);

  // Component unmount olduğunda işaretlemek için
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Auth kontrolü - deduplikasyon için geliştirildi
  const checkAuth = useCallback(
    async (force = false) => {
      // Bir sorgu zaten devam ediyorsa ve zorlanmadıysa işlemi atla
      if (authInProgress.current && !force) {
        console.log("Auth check zaten devam ediyor, atlıyorum");
        return true; // İşlem devam ediyor, başarılı kabul et
      }

      const now = Date.now();
      const CACHE_TIME = 60000; // 1 dakika

      // Eğer ilk kontrol yapılmadıysa veya force ile çağrıldıysa veya son kontrolden uzun zaman geçtiyse
      if (!initialCheckDone.current || force || now - lastCheck > CACHE_TIME) {
        try {
          // Component unmount olduysa işlemi durdur
          if (!mountedRef.current) return false;

          setLoading(true);
          authInProgress.current = true;

          console.log(
            "Auth durumu kontrol ediliyor - " +
              (force
                ? "force"
                : initialCheckDone.current
                ? "periyodik kontrol"
                : "ilk kontrol")
          );

          // Auth durumunu kontrol et
          const authResult = await dispatch(checkAuthStatus());

          // Component unmount olduysa işlemi durdur
          if (!mountedRef.current) return authResult;

          // Adres bilgilerini getir (sadece giriş yapılmışsa ve token varsa)
          if (isLogin && token) {
            try {
              await dispatch(fetchUserAddresses());
            } catch (addressError) {
              console.error("Adresler yüklenirken hata:", addressError);
              // Adres hatası işlemi engellemez
            }
          }

          // Kontrol tarihini güncelle
          setLastCheck(Date.now());
          initialCheckDone.current = true;

          return authResult;
        } catch (error) {
          console.error("Auth kontrol hatası:", error);
          return false;
        } finally {
          if (mountedRef.current) {
            setLoading(false);
          }
          authInProgress.current = false;
        }
      } else {
        console.log(
          "Auth kontrolü atlandı - son kontrol üzerinden yeterince zaman geçmedi"
        );
        return true; // Önbellekte geçerli bir değer var, başarılı kabul et
      }
    },
    [dispatch, lastCheck, isLogin, token]
  );

  // İlk yükleme kontrolü - sadece bir kez çalışır
  useEffect(() => {
    if (!initialCheckDone.current) {
      checkAuth();
    }
  }, [checkAuth]);

  // Periyodik yenileme - sadece aktif oturum varsa
  useEffect(() => {
    if (!isLogin || !token) return;

    const interval = setInterval(() => {
      checkAuth();
    }, 15 * 60 * 1000); // 15 dakikada bir

    return () => clearInterval(interval);
  }, [isLogin, token, checkAuth]);

  // Debounced yenileme fonksiyonu - asyncUtils.js'deki createDebouncedRequest kullanarak
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

  // Çıkış yap ve yönlendir
  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logout());
      router.push("/login");
    } catch (error) {
      console.error("Çıkış yapma hatası:", error);
    }
  }, [dispatch, router]);

  // Role göre yetki kontrolü
  const isAuthorized = useCallback(
    (allowedRoles = []) => {
      if (!isLogin) return false;
      if (allowedRoles.length === 0) return true; // Rol belirtilmemişse tüm giriş yapmış kullanıcılara izin ver
      return allowedRoles.includes(role);
    },
    [isLogin, role]
  );

  // Context değerini oluştur
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
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

/**
 * Auth Context Hook
 * @param {Array} allowedRoles - İzin verilen roller dizisi (boşsa tüm roller)
 * @param {string} redirectPath - Yetkisiz erişimde yönlendirilecek yol
 * @param {boolean} requireAuth - Giriş gerektirme durumu
 * @returns {Object} Auth durumu ve yardımcı fonksiyonlar
 */
export const useAuthContext = (
  allowedRoles = [],
  redirectPath = "/",
  requireAuth = true
) => {
  const context = useContext(AuthContext);
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  // Context yoksa hata fırlat
  if (!context) {
    throw new Error("useAuthContext hook must be used within an AuthProvider");
  }

  // Auth yönlendirme kontrolü
  useEffect(() => {
    // Tekrarlayan kontrolleri önle
    if (hasCheckedAuth.current) return;

    // Yükleme sırasında bir şey yapma
    if (context.loading) return;

    const checkPermissions = async () => {
      hasCheckedAuth.current = true;

      // Giriş yapmamış ve giriş gerektiren rota ise
      if (requireAuth && !context.isAuthenticated) {
        router.push("/login");
        return;
      }

      // Rol kontrolü
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
    // Yetkilendirme durumu
    isAuthorized:
      !requireAuth ||
      (context.isAuthenticated &&
        (allowedRoles.length === 0 || context.isAuthorized(allowedRoles))),
  };
};

/**
 * Basitleştirilmiş Auth Context Hook - sadece auth durumu ve yenileme için
 * @returns {Object} Basitleştirilmiş auth durumu
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth hook must be used within an AuthProvider");
  }

  // Sadece sık kullanılan özellikleri döndür
  return {
    isAuthenticated: context.isAuthenticated,
    loading: context.loading,
    user: context.user,
    role: context.role,
    refreshAuth: context.refreshAuth,
    logout: context.logout,
  };
};

export default useAuthContext;
