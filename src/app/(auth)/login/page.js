"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  login,
  checkAuthStatus,
  initiateGoogleLogin,
} from "@/lib/store/actions/userActions";
import { setError } from "@/lib/store/actions/globalActions";
import SecondaryLoading from "@/components/secondaryLoading";
import { AUTH_ERRORS } from "@/lib/authErrorMessages";
import Loading from "@/app/loading";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faUser, faLock } from "@fortawesome/free-solid-svg-icons";

const Page = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMeState] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const loading = useAppSelector((state) => state.global.loading);
  const isLogin = useAppSelector((state) => state.user.isLogin);
  const userRole = useAppSelector((state) => state.user.role);

  const getRedirectPath = (role) => {
    return role === "ADMIN" || role === "PERSONAL" ? "/dashboard" : "/";
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("expired") === "true") {
        dispatch(setError("Oturumunuz sona erdi, lütfen tekrar giriş yapın"));
      }
    }

    const checkAuth = async () => {
      const isAuthenticated = await dispatch(checkAuthStatus());
      if (isAuthenticated || isLogin) {
        router.push(getRedirectPath(userRole));
      }
    };

    checkAuth();
  }, [dispatch, router, isLogin, userRole]);

  useEffect(() => {
    if (isLogin && userRole) {
      router.push(getRedirectPath(userRole));
    }
  }, [userRole, isLogin, router]);

  const validateForm = () => {
    if (!email.trim()) {
      setErrorMessage("Email adresi gereklidir");
      return false;
    }
    if (!password.trim()) {
      setErrorMessage("Şifre gereklidir");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handleInputChange = () => {
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const result = await dispatch(
        login({
          username: email,
          password,
          rememberMe,
        })
      );

      if (result && result.error) {
        setErrorMessage(AUTH_ERRORS.INVALID_CREDENTIALS);
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage(AUTH_ERRORS.LOGIN_FAILED);
    }
  };

  const handleGoogleLogin = () => {
    localStorage.setItem("rememberMe", rememberMe.toString());
    dispatch(initiateGoogleLogin());
  };

  return (
    <div className="flex flex-col min-h-screen bg-red items-center justify-center p-4">
      {/* Ana Container */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-red overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-red to-darkred p-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <FontAwesomeIcon icon={faUser} className="text-3xl text-red" />
          </div>
          <h1 className="text-3xl font-bold text-white font-Barlow">
            Hoş Geldiniz
          </h1>
          <p className="text-yellow mt-2 font-Quattrocento_Sans">
            Hesabınıza giriş yapın
          </p>
        </div>

        {/* Form Section */}
        <div className="p-8 space-y-6">
          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red p-4 rounded-lg">
              <div className="text-sm text-red font-semibold font-Barlow">
                {errorMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className="block text-sm font-bold text-darkgray font-Barlow"
              >
                Email Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faUser} className="text-gray" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border-2 border-lightgray2 rounded-lg focus:border-yellow focus:ring-2 focus:ring-yellow focus:ring-opacity-50 transition-all duration-200 font-Quattrocento_Sans placeholder:text-gray"
                  placeholder="Email adresinizi girin"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    handleInputChange();
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="block text-sm font-bold text-darkgray font-Barlow"
              >
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faLock} className="text-gray" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-3 border-2 border-lightgray2 rounded-lg focus:border-yellow focus:ring-2 focus:ring-yellow focus:ring-opacity-50 transition-all duration-200 font-Quattrocento_Sans placeholder:text-gray"
                  placeholder="Şifrenizi girin"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    handleInputChange();
                  }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <FontAwesomeIcon 
                    icon={showPassword ? faEyeSlash : faEye} 
                    className="text-gray hover:text-darkgray transition-colors"
                  />
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  disabled={loading}
                  className="h-4 w-4 rounded border-2 border-lightgray2 text-yellow focus:ring-yellow focus:ring-2"
                  checked={rememberMe}
                  onChange={(e) => setRememberMeState(e.target.checked)}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 text-sm font-semibold text-darkgray font-Barlow"
                >
                  Beni Hatırla
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-red hover:text-darkred transition-colors font-Barlow"
              >
                Şifremi Unuttum?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-200 font-Barlow shadow-lg transform ${
                loading
                  ? "bg-gray cursor-not-allowed opacity-60"
                  : "bg-red hover:bg-darkred hover:shadow-xl hover:scale-105 active:scale-95"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <SecondaryLoading size="medium" />
                  <span className="ml-2">Giriş yapılıyor...</span>
                </div>
              ) : (
                "Giriş Yap"
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-lightgray2"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray font-Barlow font-semibold">
                  veya
                </span>
              </div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-bold bg-green-600 text-white border-2 border-lightgray2  transition-all duration-200 font-Barlow shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 flex items-center justify-center"
            >
              <svg className="w-7 h-7 mr-3 bg-white rounded-full" viewBox="0 0 24 24">
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
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 1.98 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l2.85 2.84C6.71 7.31 9.14 5.38 12 5.38z"
                />
              </svg>
              Google ile Giriş Yap
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center pt-4 border-t border-lightgray2">
            <p className="text-gray font-Quattrocento_Sans">
              Hesabınız yok mu?{" "}
              <Link
                href="/signup"
                className="font-bold text-red hover:text-darkred transition-colors font-Barlow"
              >
                Üye Ol
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-yellow font-Quattrocento_Sans text-sm">
          © 2024 Teknolojik Yemekler. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  );
};

export default Page;