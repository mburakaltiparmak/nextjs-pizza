'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchUserProfile, fetchUserAddresses, logout } from '@/lib/store/actions/userActions';
import { getSafeErrorMessage } from '@/lib/authErrorMessages';

/**
 * Kimlik doğrulama, kullanıcı verisi ve yetkilendirme yönetimi için hook
 * @param {Array} allowedRoles - İzin verilen roller dizisi (boş dizi tüm rollere izin verir)
 * @param {string} redirectPath - Yetkisiz erişimde yönlendirilecek yol
 * @param {boolean} requireAuth - Giriş gerektirme durumu
 * @returns {Object} Auth durumu ve yardımcı fonksiyonlar
 */
export const useAuth = (allowedRoles = [], redirectPath = '/', requireAuth = true) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  
  // Redux state'inden kullanıcı bilgilerini al
  const isLogin = useAppSelector(state => state.user.isLogin);
  const user = useAppSelector(state => state.user.profile);
  const role = useAppSelector(state => state.user.role);
  const addresses = useAppSelector(state => state.user.addresses);
  const error = useAppSelector(state => state.user.error);
  
  // Sayfa yüklendiğinde kimlik doğrulama durumunu kontrol et
// useAuth hook içinde adres yükleme hatalarını daha iyi yöneterek isloading durumlarını ekleyebiliriz
useEffect(() => {
const checkAuthStatus = async () => {
  setLoading(true);
  
  try {
    const token = localStorage.getItem('token');
    
    // Token varsa
    if (token) {
      console.log("Kimlik doğrulama kontrolü - token var");
      
      // instance başlığına token'ı manuel olarak ekleyelim (güvenlik için)
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      try {
        // Profil bilgilerini getir
        const profileResult = await dispatch(fetchUserProfile());
        
        if (profileResult && !profileResult.error) {
          console.log("Profil başarıyla alındı");
          
          // Adres bilgilerini getirmeyi dene
          try {
            await dispatch(fetchUserAddresses());
          } catch (addressError) {
            console.error("Adres yüklenirken hata:", addressError);
            // Adres hatası işlemi engellemez
          }
        } else {
          console.error("Profil yüklenemedi:", profileResult?.error);
        }
      } catch (profileError) {
        console.error("Profil yükleme hatası:", profileError);
      }
    } else {
      console.log("Token bulunamadı - giriş yapılmamış");
    }
  } catch (error) {
    console.error("Kimlik doğrulama kontrolü hatası:", error);
  } finally {
    setLoading(false);
  }
};

  checkAuthStatus();
}, [dispatch, isLogin]);
  // Yetkilendirme kontrolü
  useEffect(() => {
    // Yükleme sırasında bir şey yapma
    if (loading) return;
    
    // Giriş yapmamış ve giriş gerektiren rota ise
    if (requireAuth && !isLogin) {
      router.push('/login');
      return;
    }
    
    // Rol kontrolü - izin verilen roller boş değilse ve kullanıcının rolü bu listede değilse
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      router.push(redirectPath);
      return;
    }
  }, [isLogin, role, router, allowedRoles, redirectPath, requireAuth, loading]);

  // Varsayılan adres getir
  const getDefaultAddress = () => {
    if (!addresses || addresses.length === 0) return null;
    return addresses.find(address => address.isDefault) || addresses[0];
  };

  // Güvenli hata mesajı getir
  const getErrorMessage = (err) => {
    return getSafeErrorMessage(err || error);
  };
  
  // Çıkış yap ve yönlendir
  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return {
    isAuthenticated: isLogin,
    user,
    role,
    loading,
    error,
    addresses,
    getDefaultAddress,
    getErrorMessage,
    logout: handleLogout,
    // Yetkilendirme durumu
    isAuthorized: !requireAuth || (isLogin && (allowedRoles.length === 0 || allowedRoles.includes(role)))
  };
};

export default useAuth;