// src/components/user-button/ForgotPasswordDialog.jsx
"use client";
import React from "react";
import { X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import SecondaryLoading from "@/components/secondaryLoading";

export const ForgotPasswordDialog = ({
  forgotPasswordOpen,
  setForgotPasswordOpen,
  forgotPasswordEmail,
  setForgotPasswordEmail,
  forgotPasswordError,
  setForgotPasswordError,
  forgotPasswordSuccess,
  handleForgotPassword,
  loading,
  onBackToLogin,
  resetForgotPassword,
}) => {
  const handleClose = () => {
    setForgotPasswordOpen(false);
    resetForgotPassword();
  };

  return (
    <AlertDialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
      <AlertDialogContent className="max-w-md max-md:max-w-[95vw] max-md:mx-2">
        <div className="relative">
          <button
            onClick={handleClose}
            className="absolute right-0 top-0 p-2 hover:bg-lightgray rounded-full transition-colors"
            aria-label="Kapat"
          >
            <X size={20} className="text-darkgray" />
          </button>

          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-red font-Londrina_Solid">
              Şifremi Unuttum
            </AlertDialogTitle>
            <AlertDialogDescription className="text-darkgray">
              E-posta adresinizi girin, size şifre sıfırlama bağlantısı
              gönderelim.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {forgotPasswordSuccess ? (
            <div className="space-y-4 mt-6">
              <div className="bg-green-50 border border-green-500 text-green-700 px-4 py-3 rounded-lg">
                Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen
                e-postanızı kontrol edin.
              </div>
              <button
                onClick={handleClose}
                className="w-full py-3 px-4 rounded-lg font-bold bg-yellow text-red hover:bg-lightyellow hover:text-darkred transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
              >
                Tamam
              </button>
            </div>
          ) : (
            <div className="space-y-6 mt-6">
              {forgotPasswordError && (
                <div className="bg-red-50 border border-red text-red px-4 py-3 rounded-lg text-sm">
                  {forgotPasswordError}
                </div>
              )}

              <div>
                <label
                  htmlFor="forgot-password-email"
                  className="block text-sm font-semibold text-darkgray mb-2"
                >
                  E-posta Adresi
                </label>
                <input
                  id="forgot-password-email"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => {
                    setForgotPasswordEmail(e.target.value);
                    setForgotPasswordError("");
                  }}
                  className="w-full px-4 py-3 border-2 border-lightgray rounded-lg focus:ring-2 focus:ring-yellow focus:border-yellow transition-all text-darkgray"
                  placeholder="ornek@email.com"
                />
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-200 ${
                    loading
                      ? "bg-gray cursor-not-allowed opacity-60"
                      : "bg-red hover:bg-darkred shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <SecondaryLoading size="medium" />
                    </div>
                  ) : (
                    "Şifre Sıfırlama Bağlantısı Gönder"
                  )}
                </button>

                <button
                  onClick={onBackToLogin}
                  className="w-full py-3 px-4 rounded-lg font-bold bg-yellow text-red hover:bg-lightyellow hover:text-darkred transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                >
                  Giriş Ekranına Dön
                </button>
              </div>
            </div>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};