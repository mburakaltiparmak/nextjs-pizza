"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { login, checkAuthStatus } from "@/lib/store/actions/userActions";
import SecondaryLoading from "@/components/secondaryLoading";
import { AUTH_ERRORS } from "@/lib/authErrorMessages"; // güvenli hata mesajları için

const Page = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMeState] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Yerel hata durumu
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Redux state
  const loading = useAppSelector((state) => state.global.loading);
  const globalError = useAppSelector((state) => state.global.error);
  const isLogin = useAppSelector((state) => state.user.isLogin);
  const userRole = useAppSelector((state) => state.user.role);

  // Kullanıcının rolüne göre yönlendirilecek sayfa
  const getRedirectPath = (role) => {
    // Admin veya Personel ise dashboard'a, değilse ana sayfaya yönlendir
    return role === "ADMIN" || role === "PERSONAL" ? "/dashboard" : "/";
  };

  // Kullanıcı zaten giriş yapmışsa uygun sayfaya yönlendir
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = dispatch(checkAuthStatus());
      
      if (isAuthenticated || isLogin) {
        const redirectPath = getRedirectPath(userRole);
        router.push(redirectPath);
      }
    };
    
    checkAuth();
  }, [dispatch, router, isLogin, userRole]);

  // Login sonrası yönlendirme için userRole değişikliklerini izle
  useEffect(() => {
    if (isLogin && userRole) {
      const redirectPath = getRedirectPath(userRole);
      router.push(redirectPath);
    }
  }, [userRole, isLogin, router]);

  const validateForm = () => {
    // Form doğrulama
    if (!username.trim()) {
      setErrorMessage("Kullanıcı adı gereklidir");
      return false;
    }
    
    if (!password.trim()) {
      setErrorMessage("Şifre gereklidir");
      return false;
    }
    
    // Hata mesajını temizle
    setErrorMessage("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form alanlarını doğrula
    if (!validateForm()) {
      return;
    }

    const formData = {
      email: username,
      password: password,
      rememberMe: rememberMe
    };

    try {
      const result = await dispatch(login(formData));
      
      // Login başarılıysa ve token varsa, userRole useEffect tarafından izlenerek yönlendirme yapılacak
      if (result && result.error) {
        // Güvenli bir hata mesajı kullan
        setErrorMessage(AUTH_ERRORS.INVALID_CREDENTIALS);
      }
    } catch (err) {
      // Asla ham hataları gösterme, her zaman güvenli bir mesaj kullan
      console.error("Login error:", err);
      setErrorMessage(AUTH_ERRORS.LOGIN_FAILED);
    }
  };

  // Formdaki değişiklikler için hata mesajını temizle
  const handleInputChange = () => {
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-red items-center justify-center">
      <div className="w-full bg-yellow max-w-md space-y-4 border-2 shadow-black border-transparent rounded-md p-16">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight font-Barlow text-red">
            Admin Girişi
          </h2>
        </div>

        {errorMessage && (
          <div className="font-Barlow rounded-md bg-red p-4">
            <div className="text-sm text-lightgray">{errorMessage}</div>
          </div>
        )}

        <form className="mt-8 space-y-6 font-Quattrocento_Sans" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="username" className="sr-only">
                Kullanıcı Adı
              </label>
              <input
                id="username"
                name="username"
                type="string"
                required
                disabled={loading}
                className="relative block w-full rounded-t-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-red sm:text-sm sm:leading-6"
                placeholder="Kullanıcı adı"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  handleInputChange();
                }}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={loading}
                className="relative block w-full rounded-b-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-red sm:text-sm sm:leading-6"
                placeholder="Şifre"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  handleInputChange();
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                disabled={loading}
                className="h-4 w-4 rounded border-gray-300 text-red focus:ring-red"
                checked={rememberMe}
                onChange={(e) => setRememberMeState(e.target.checked)}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Beni Hatırla
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red ${
                loading 
                  ? 'bg-red-400 cursor-not-allowed' 
                  : 'bg-red hover:bg-red-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <SecondaryLoading size="small" />
                  <span className="ml-2">Giriş Yapılıyor...</span>
                </div>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Page;