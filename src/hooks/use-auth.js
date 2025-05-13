"use client";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks";
import { logout } from "@/lib/store/actions/userActions";
import { useAuthContext } from "@/lib/context/authContext"; // Context import

/**
 * Kimlik doğrulama, kullanıcı verisi ve yetkilendirme yönetimi için hook
 * Bu hook, geriye dönük uyumluluk için eski API'yi korur, ancak yeni AuthContext'i kullanır
 *
 * @param {Array} allowedRoles - İzin verilen roller dizisi (boş dizi tüm rollere izin verir)
 * @param {string} redirectPath - Yetkisiz erişimde yönlendirilecek yol
 * @param {boolean} requireAuth - Giriş gerektirme durumu
 * @returns {Object} Auth durumu ve yardımcı fonksiyonlar
 */
export const useAuth = (
  allowedRoles = [],
  redirectPath = "/",
  requireAuth = true
) => {
  // Yeni context sistemini kullan ama eski hook API'sini koru
  const authContext = useAuthContext(allowedRoles, redirectPath, requireAuth);
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Çıkış işlemi için orijinal dispatch'i koru (geriye dönük uyumluluk için)
  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return {
    isAuthenticated: authContext.isAuthenticated,
    user: authContext.user,
    role: authContext.role,
    loading: authContext.loading,
    error: authContext.error,
    addresses: authContext.addresses,
    getDefaultAddress: authContext.getDefaultAddress,
    getErrorMessage: authContext.getErrorMessage,
    logout: handleLogout,
    refreshAuth: authContext.refreshAuth,
    isAuthorized: authContext.isAuthorized,
  };
};

export default useAuth;
