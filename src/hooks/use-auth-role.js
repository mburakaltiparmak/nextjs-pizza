'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks';

/**
 * Rol tabanlı rota koruması için hook
 * @param {Array} allowedRoles - İzin verilen roller dizisi
 * @param {string} redirectPath - Yetki yoksa yönlendirilecek yol
 * @param {boolean} requireAuth - Kimlik doğrulama gerekli mi
 */
const useAuthRoute = (
  allowedRoles = [], 
  redirectPath = '/',
  requireAuth = true
) => {
  const router = useRouter();
  const { isLogin, role } = useAppSelector(state => state.user);
  
  useEffect(() => {
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
  }, [isLogin, role, router, allowedRoles, redirectPath, requireAuth]);
  
  // Giriş durumunu ve kontrolün geçip geçmediğini döndür
  return {
    isAuthorized: !requireAuth || (isLogin && (allowedRoles.length === 0 || allowedRoles.includes(role))),
    isAuthenticated: isLogin,
    userRole: role
  };
};

export default useAuthRoute;