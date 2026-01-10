"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoadingSpinner } from "../ui/LoadingSpinner";

export function RegisterForm({
    onSubmit,
    onGoogleLogin,
    onLoginClick,
    loading = false,
    errorMessage = null,
}) {
    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
    });

    const [touched, setTouched] = useState({});
    const [fieldValidations, setFieldValidations] = useState({});

    const validateField = (name, value) => {
        switch (name) {
            case 'name':
            case 'surname':
                return value.length >= 2;
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'phoneNumber':
                return /^[0-9]{10,11}$/.test(value.replace(/\s/g, ''));
            case 'password':
                return value.length >= 6;
            case 'confirmPassword':
                return value === formData.password;
            default:
                return true;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Validate on change
        setFieldValidations(prev => ({
            ...prev,
            [name]: validateField(name, value)
        }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        setFieldValidations(prev => ({
            ...prev,
            [name]: validateField(name, formData[name])
        }));
    };

    const isFormValid = Object.keys(formData).every(key => validateField(key, formData[key]));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isFormValid && onSubmit) {
            onSubmit(formData);
        }
    };

    return (
        <div className="space-y-3 bg-white">
            {errorMessage && (
                <div className="bg-red-50 border-l-4 border-red p-2 rounded-lg">
                    <div className="text-xs text-red font-semibold font-Barlow">
                        {errorMessage}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <label htmlFor="name" className="block text-xs font-bold text-darkgray font-Barlow">
                            İsim
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            placeholder="John"
                            className={`w-full px-3 py-2 text-xs border-2 rounded-lg transition-all ${touched.name && !fieldValidations.name
                                ? "border-red"
                                : "border-lightgray2 focus:border-yellow"
                                } focus:outline-none focus:ring-opacity-50 font-Quattrocento_Sans`}
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={loading}
                        />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="surname" className="block text-xs font-bold text-darkgray font-Barlow">
                            Soyisim
                        </label>
                        <input
                            id="surname"
                            name="surname"
                            type="text"
                            required
                            placeholder="Doe"
                            className={`w-full px-3 py-2 text-xs border-2 rounded-lg transition-all ${touched.surname && !fieldValidations.surname
                                ? "border-red"
                                : "border-lightgray2 focus:border-yellow"
                                } focus:outline-none focus:ring-opacity-50 font-Quattrocento_Sans`}
                            value={formData.surname}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label htmlFor="email" className="block text-xs font-bold text-darkgray font-Barlow">
                        E-posta
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="mail@example.com"
                        className={`w-full px-3 py-2 text-xs border-2 rounded-lg transition-all ${touched.email && !fieldValidations.email
                            ? "border-red"
                            : "border-lightgray2 focus:border-yellow"
                            } focus:outline-none focus:ring-opacity-50 font-Quattrocento_Sans`}
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={loading}
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="phoneNumber" className="block text-xs font-bold text-darkgray font-Barlow">
                        Telefon
                    </label>
                    <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        required
                        placeholder="05*********"
                        className={`w-full px-3 py-2 text-xs border-2 rounded-lg transition-all ${touched.phoneNumber && !fieldValidations.phoneNumber
                            ? "border-red"
                            : "border-lightgray2 focus:border-yellow"
                            } focus:outline-none focus:ring-opacity-50 font-Quattrocento_Sans`}
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={loading}
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <label htmlFor="password" className="block text-xs font-bold text-darkgray font-Barlow">
                            Şifre
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="6+ kar."
                            className={`w-full px-3 py-2 text-xs border-2 rounded-lg transition-all ${touched.password && !fieldValidations.password
                                ? "border-red"
                                : "border-lightgray2 focus:border-yellow"
                                } focus:outline-none focus:ring-opacity-50 font-Quattrocento_Sans`}
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={loading}
                        />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="confirmPassword" className="block text-xs font-bold text-darkgray font-Barlow">
                            Tekrar
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            placeholder="Tekrar"
                            className={`w-full px-3 py-2 text-xs border-2 rounded-lg transition-all ${touched.confirmPassword && !fieldValidations.confirmPassword
                                ? "border-red"
                                : "border-lightgray2 focus:border-yellow"
                                } focus:outline-none focus:ring-opacity-50 font-Quattrocento_Sans`}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={loading}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!isFormValid || loading}
                    className={`w-full py-2.5 px-4 rounded-lg font-bold text-white transition-all duration-200 font-Barlow shadow-md transform text-sm ${!isFormValid || loading
                        ? "bg-gray cursor-not-allowed opacity-60"
                        : "bg-red hover:bg-darkred hover:shadow-lg hover:scale-105 active:scale-95"
                        }`}
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <LoadingSpinner size="small" className="mr-2" />
                            <span>Kayıt Olunuyor...</span>
                        </div>
                    ) : (
                        "Üye Ol"
                    )}
                </button>

                <div className="relative py-1">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-lightgray2"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white text-gray font-Barlow font-semibold">veya</span>
                    </div>
                </div>

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
                        Google ile Üye Ol
                    </button>
                )}
            </form>

            {onLoginClick && (
                <div className="text-center pt-2 border-t border-lightgray2">
                    <p className="text-gray font-Quattrocento_Sans text-xs">
                        Zaten üye misiniz?{" "}
                        <button
                            onClick={onLoginClick}
                            className="font-bold text-red hover:text-darkred transition-colors font-Barlow"
                        >
                            Giriş Yap
                        </button>
                    </p>
                </div>
            )}
        </div>
    );
}
