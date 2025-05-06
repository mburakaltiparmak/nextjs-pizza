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

const Page = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMeState] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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
    localStorage.setItem("tempRememberMe", rememberMe ? "true" : "false");
    dispatch(initiateGoogleLogin());
  };

  return (
    <div className="flex flex-col min-h-screen bg-red items-center justify-center">
      <div className="space-y-4 border-transparent rounded-md bg-yellow p-16 w-full">
        <h2 className="text-center text-3xl font-bold tracking-tight font-Barlow text-red">
          Giriş Yap
        </h2>

        {errorMessage && (
          <div className="font-Barlow rounded-md bg-red p-4">
            <div className="text-sm text-lightgray">{errorMessage}</div>
          </div>
        )}

        <form
          className="mt-8 space-y-6 font-Quattrocento_Sans"
          onSubmit={handleSubmit}
        >
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <input
                id="username"
                name="username"
                type="email"
                required
                disabled={loading}
                className="relative block w-full rounded-t-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-red sm:text-sm sm:leading-6"
                placeholder="Email adresiniz"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  handleInputChange();
                }}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={loading}
                className="relative block w-full rounded-b-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-red sm:text-sm sm:leading-6"
                placeholder="Şifreniz"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  handleInputChange();
                }}
              />
            </div>
          </div>

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
            <label htmlFor="remember-me" className="ml-2 text-sm text-gray-900">
              Beni Hatırla
            </label>
          </div>
          <div className="flex flex-col space-y-2">
            <button
              type="submit"
              disabled={loading}
              className={`group relative flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red ${
                loading
                  ? "bg-red cursor-not-allowed"
                  : "bg-green-800 hover:bg-green-600"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <SecondaryLoading size="small" />
                  <span className="ml-2">Giriş Yapılıyor...</span>
                </div>
              ) : (
                "Giriş Yap"
              )}
            </button>
            {
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="group relative flex w-full justify-center items-center rounded-md border border-white px-3 py-2 text-sm font-semibold bg-darkred text-white hover:bg-red"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                
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
          }
          </div>
        </form>
      </div>
    </div>
  );
};

export default Page;
