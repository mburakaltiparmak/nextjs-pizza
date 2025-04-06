"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { login, checkAuthStatus, initiateGoogleLogin } from "@/lib/store/actions/userActions";
import { setError } from "@/lib/store/actions/globalActions"; // Import setError
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

  // Combined useEffect for auth checking and URL param handling
  useEffect(() => {
    // Check login session expired URL parameter
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get('expired') === 'true') {
        dispatch(setError("Oturumunuz sona erdi, lütfen tekrar giriş yapın"));
      }
    }

    // Check authentication status
    const checkAuth = async () => {
      const isAuthenticated = await dispatch(checkAuthStatus());
      
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
      username: username,
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

  // Google ile giriş yap
  const handleGoogleLogin = () => {
    dispatch(initiateGoogleLogin());
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
            Giriş Yap
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

        {/* Google ile giriş bölümü */}
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-yellow text-gray-600">veya</span>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex justify-center items-center gap-3 font-Barlow text-sm bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded-md shadow-sm transition duration-150"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
                <path fill="none" d="M1 1h22v22H1z" />
              </svg>
              Google ile Giriş Yap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;