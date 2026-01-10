"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import { LoadingSpinner } from "../ui/LoadingSpinner";

export function LoginForm({
    onSubmit,
    onGoogleLogin,
    onForgotPassword,
    onSignupClick,
    onGuestCheckout,
    loading = false,
    errorMessage = null,
}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit({ email, password, rememberMe });
        }
    };

    return (
        <div className="space-y-3 bg-white">
            {/* Error Message */}
            {errorMessage && (
                <div className="bg-red-50 border-l-4 border-red p-2 rounded-lg">
                    <div className="text-xs text-red font-semibold font-Barlow">
                        {errorMessage}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
                {/* Email Input */}
                <div className="space-y-1">
                    <label
                        htmlFor="email"
                        className="block text-xs font-bold text-darkgray font-Barlow"
                    >
                        Email Adresi
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FontAwesomeIcon icon={faUser} className="text-gray text-xs" />
                        </div>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            disabled={loading}
                            className="w-full pl-9 pr-3 py-2 text-sm border-2 border-lightgray2 rounded-lg focus:border-yellow focus:ring-2 focus:ring-yellow focus:ring-opacity-50 transition-all duration-200 font-Quattrocento_Sans placeholder:text-gray"
                            placeholder="Email adresinizi girin"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                    <label
                        htmlFor="password"
                        className="block text-xs font-bold text-darkgray font-Barlow"
                    >
                        Şifre
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FontAwesomeIcon icon={faLock} className="text-gray text-xs" />
                        </div>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            disabled={loading}
                            className="w-full pl-9 pr-9 py-2 text-sm border-2 border-lightgray2 rounded-lg focus:border-yellow focus:ring-2 focus:ring-yellow focus:ring-opacity-50 transition-all duration-200 font-Quattrocento_Sans placeholder:text-gray"
                            placeholder="Şifrenizi girin"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <FontAwesomeIcon
                                icon={showPassword ? faEyeSlash : faEye}
                                className="text-gray hover:text-darkgray transition-colors text-xs"
                            />
                        </button>
                    </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            disabled={loading}
                            className="h-3.5 w-3.5 rounded border-2 border-lightgray2 text-yellow focus:ring-yellow focus:ring-2"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label
                            htmlFor="remember-me"
                            className="ml-1.5 text-xs font-semibold text-darkgray font-Barlow"
                        >
                            Beni Hatırla
                        </label>
                    </div>
                    {onForgotPassword && (
                        <button
                            type="button"
                            onClick={onForgotPassword}
                            className="text-xs font-semibold text-red hover:text-darkred transition-colors font-Barlow"
                        >
                            Şifremi Unuttum?
                        </button>
                    )}
                </div>

                {/* Login Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2.5 px-4 rounded-lg font-bold text-white transition-all duration-200 font-Barlow shadow-md transform text-sm ${loading
                        ? "bg-gray cursor-not-allowed opacity-60"
                        : "bg-red hover:bg-darkred hover:shadow-lg hover:scale-105 active:scale-95"
                        }`}
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <LoadingSpinner size="small" className="mr-2" />
                            <span>Giriş yapılıyor...</span>
                        </div>
                    ) : (
                        "Giriş Yap"
                    )}
                </button>

                {/* Divider */}
                <div className="relative py-1">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-lightgray2"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white text-gray font-Barlow font-semibold">
                            veya
                        </span>
                    </div>
                </div>

                {/* Google Login Button */}
                {onGoogleLogin && (
                    <button
                        type="button"
                        onClick={onGoogleLogin}
                        disabled={loading}
                        className="w-full py-2.5 px-4 rounded-lg font-bold bg-green-600 text-white border-2 border-lightgray2 transition-all duration-200 font-Barlow shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 flex items-center justify-center text-sm"
                    >
                        <svg className="w-5 h-5 mr-2 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
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
                )}

                {/* Guest Checkout Button */}
                {onGuestCheckout && (
                    <button
                        type="button"
                        onClick={onGuestCheckout}
                        disabled={loading}
                        className="w-full py-2.5 px-4 rounded-lg font-bold bg-gray-100 text-darkgray border-2 border-lightgray2 transition-all duration-200 font-Barlow shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 flex items-center justify-center text-sm hover:bg-gray-200"
                    >
                        <FontAwesomeIcon icon={faUser} className="mr-2 opacity-50" />
                        Misafir Olarak Devam Et
                    </button>
                )}
            </form>

            {/* Sign Up Link */}
            {onSignupClick && (
                <div className="text-center pt-2 border-t border-lightgray2">
                    <p className="text-gray font-Quattrocento_Sans text-xs">
                        Hesabınız yok mu?{" "}
                        <button
                            type="button"
                            className="font-bold text-red hover:text-darkred transition-colors font-Barlow"
                            onClick={onSignupClick}
                        >
                            Üye Ol
                        </button>
                    </p>
                </div>
            )}
        </div>
    );
}
