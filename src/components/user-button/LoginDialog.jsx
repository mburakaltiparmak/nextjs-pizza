// src/components/user-button/LoginDialog.jsx
"use client";
import React from "react";
import { X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import SecondaryLoading from "@/components/secondaryLoading";

export const LoginDialog = ({
  loginOpen,
  setLoginOpen,
  email,
  setEmail,
  password,
  setPassword,
  rememberMe,
  setRememberMe,
  errorMessage,
  handleInputChange,
  handleLogin,
  handleGoogleLogin,
  loading,
  onForgotPassword,
}) => {
  return (
    <AlertDialog open={loginOpen} onOpenChange={setLoginOpen}>
      <AlertDialogTrigger asChild>
        <button className="h-10 max-md:h-8 max-md:w-16 max-md:text-xs max-md:gap-1 px-4 py-2 bg-yellow text-red hover:bg-black hover:text-yellow ring-2 ring-inset ring-black hover:ring-yellow rounded-lg font-Barlow font-bold text-sm inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:bg-opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95">
          <FontAwesomeIcon icon={faUser} className="mr-2 max-md:mr-0" />
          <span className="max-md:hidden">Giriş Yap</span>
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-md max-md:max-w-[95vw] max-md:mx-2 bg-white/95 backdrop-blur-sm border-2 border-yellow rounded-2xl shadow-2xl">
        <div className="relative">
          <button
            onClick={() => setLoginOpen(false)}
            className="absolute -right-2 -top-2 p-2 hover:bg-lightgray rounded-full transition-colors group"
            aria-label="Kapat"
          >
            <X size={20} className="text-gray group-hover:text-red transition-colors" />
          </button>

          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl font-bold text-red font-Barlow text-center border-b-2 border-lightgray2 pb-4">
              Giriş Yap
            </AlertDialogTitle>
            <AlertDialogDescription className="text-darkgray font-Barlow text-center mt-2 text-base">
              Hesabınıza giriş yaparak siparişlerinizi takip edebilir ve özel
              avantajlardan yararlanabilirsiniz.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-6 mt-6 font-Barlow">
            {errorMessage && (
              <div className="bg-red/10 border border-red text-red px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center">
                {errorMessage}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-darkgray mb-2 ml-1"
                >
                  E-posta Adresi
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    handleInputChange();
                  }}
                  className="w-full px-4 py-3 border-2 border-lightgray2 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow focus:border-yellow transition-all text-darkgray placeholder-gray bg-lightgray/50 hover:bg-white"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-darkgray mb-2 ml-1"
                >
                  Şifre
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    handleInputChange();
                  }}
                  className="w-full px-4 py-3 border-2 border-lightgray2 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow focus:border-yellow transition-all text-darkgray placeholder-gray bg-lightgray/50 hover:bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-lightgray2 text-red focus:ring-yellow"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm font-medium text-gray hover:text-darkgray cursor-pointer transition-colors"
                >
                  Beni Hatırla
                </label>
              </div>
              <div className="text-sm">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="font-semibold text-red hover:text-yellow transition-colors"
                >
                  Şifremi Unuttum
                </button>
              </div>
            </div>

            <div className="flex flex-col space-y-3 pt-2">
              <button
                onClick={handleLogin}
                disabled={loading}
                className={`w-full py-3.5 px-4 rounded-xl font-bold font-Barlow text-lg text-white transition-all duration-300 ${loading
                  ? "bg-gray cursor-not-allowed opacity-60"
                  : "bg-red hover:bg-yellow hover:text-red shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <SecondaryLoading size="medium" />
                    <span>Giriş Yapılıyor...</span>
                  </div>
                ) : (
                  "Giriş Yap"
                )}
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-lightgray2 w-full absolute"></div>
                <span className="px-3 text-gray text-sm font-medium relative z-10">veya</span>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold font-Barlow bg-white hover:bg-gray-50 text-darkgray border-2 border-lightgray2 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group"
              >
                <svg
                  className="w-6 h-6 bg-transparent"
                  viewBox="0 0 24 24"
                >
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
                </svg>
                <span className="group-hover:text-darkgray transition-colors">Google ile Devam Et</span>
              </button>
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );

};