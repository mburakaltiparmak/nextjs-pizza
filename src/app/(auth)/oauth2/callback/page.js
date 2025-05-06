"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  fetchUserProfile,
  setIsLogin,
  setToken,
  setAuthProvider,
  setEmail,
  setRememberMe,
} from "@/lib/store/actions/userActions";
import { setSuccess, setError } from "@/lib/store/actions/globalActions";

export default function OAuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const processAuth = async () => {
      try {
        console.log(
          "OAuth callback işleniyor - parametreler:",
          Object.fromEntries(searchParams.entries())
        );

        // Check for error parameter first
        const errorMsg = searchParams.get("error");
        if (errorMsg) {
          console.error("OAuth hata parametresi:", errorMsg);
          setStatus("error");
          setMessage(decodeURIComponent(errorMsg));
          dispatch(setError(decodeURIComponent(errorMsg)));
          return;
        }

        const token = searchParams.get("token");
        console.log("Token durumu:", token ? "mevcut" : "eksik");

        if (!token) {
          console.error("Token bulunamadı");
          setStatus("error");
          setMessage("Kimlik doğrulama bilgisi alınamadı.");
          dispatch(setError("Kimlik doğrulama bilgisi alınamadı."));
          return;
        }

        // Token formatını doğrula
        if (!isValidToken(token)) {
          console.error("Geçersiz token formatı");
          setStatus("error");
          setMessage("Geçersiz kimlik doğrulama bilgisi.");
          dispatch(setError("Geçersiz kimlik doğrulama bilgisi."));
          return;
        }

        // "Beni hatırla" tercihini al
        const rememberMe = localStorage.getItem("tempRememberMe") === "true";
        console.log("RememberMe durumu:", rememberMe);

        // Redux store'u güncelle
        dispatch(setToken(token));
        dispatch(setIsLogin(true));
        dispatch(setAuthProvider("google"));
        dispatch(setRememberMe(rememberMe));

        // Token'ı uygun storage'a kaydet
        const storage = rememberMe ? localStorage : sessionStorage;
        try {
          storage.setItem("token", token);
          console.log(
            "Token başarıyla saklandı:",
            storage === localStorage ? "localStorage" : "sessionStorage"
          );
        } catch (storageError) {
          console.error("Token depolama hatası:", storageError);
        }

        // "Beni hatırla" durumunu localStorage'a kaydet
        localStorage.setItem("rememberMe", rememberMe ? "true" : "false");

        // Kullanıcı bilgilerini getir
        try {
          const userData = await dispatch(fetchUserProfile());

          // Kullanıcı email bilgisini kaydet
          if (userData && userData.email) {
            storage.setItem("userEmail", userData.email);
            dispatch(setEmail(userData.email));
          } else {
            console.warn("Kullanıcı profil bilgilerinde email bulunamadı");
          }
        } catch (profileError) {
          console.error(
            "Kullanıcı profil bilgileri getirme hatası:",
            profileError
          );
          // Profil bilgileri hata verse bile login sürecine devam et
        }

        // Başarı mesajı
        dispatch(setSuccess("Google ile giriş başarılı"));

        // Geçici "Beni hatırla" verisini temizle
        localStorage.removeItem("tempRememberMe");

        setStatus("success");
        setMessage("Giriş başarılı! Yönlendiriliyorsunuz...");

        // Geri dönüş URL'ine yönlendir
        const returnUrl = localStorage.getItem("authReturnUrl") || "/";
        localStorage.removeItem("authReturnUrl"); // Temizle

        // Kısa bir gecikme ekle - kullanıcının başarı mesajını görmesi için
        setTimeout(() => {
          router.push(returnUrl);
        }, 1500);
      } catch (error) {
        console.error("OAuth işleme hatası:", error);
        // Detaylı hata log'u
        console.error("Hata detayları:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });

        setStatus("error");
        setMessage("Giriş işlemi sırasında bir hata oluştu.");
        dispatch(setError("Giriş işlemi sırasında bir hata oluştu."));
      }
    };

    processAuth();
  }, [searchParams, dispatch, router]);

  // Token doğrulama fonksiyonu
  const isValidToken = (token) => {
    return token && token.length > 20; // Basit bir doğrulama, gerçek JWT doğrulaması olabilir
  };

  // Status cards based on the current authentication status
  const statusCards = {
    loading: (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="w-16 h-16 relative mb-6">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-Barlow font-bold text-gray-800 mb-3">
          Bağlanıyor
        </h2>
        <p className="text-gray-600 font-Quattrocento_Sans text-center">
          Google ile giriş yapılıyor, lütfen bekleyin...
        </p>
      </div>
    ),

    success: (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg border-l-4 border-green-500">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <h2 className="text-3xl font-Barlow font-bold text-gray-800 mb-2">
          Giriş Başarılı!
        </h2>
        <p className="text-gray-600 font-Quattrocento_Sans text-center mb-6">
          {message}
        </p>
        <div className="w-full max-w-xs bg-gray-100 h-2 rounded-full overflow-hidden">
          <div className="bg-green-500 h-full animate-pulse"></div>
        </div>
      </div>
    ),

    error: (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg border-l-4 border-red">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <svg
            className="w-8 h-8 text-red"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </div>
        <h2 className="text-3xl font-Barlow font-bold text-gray-800 mb-2">
          Giriş Başarısız
        </h2>
        <p className="text-gray-600 font-Quattrocento_Sans text-center mb-6">
          {message}
        </p>
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-3 bg-red text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-Barlow font-medium flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11 17l-5-5m0 0l5-5m-5 5h12"
            ></path>
          </svg>
          Giriş Sayfasına Dön
        </button>
      </div>
    ),
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Logo or Brand Element */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-Londrina_Solid text-red">
            Teknolojik Yemekler
          </h1>
          <p className="text-gray-600 font-Quattrocento_Sans">
            Google ile Giriş
          </p>
        </div>

        {/* Auth Status Card */}
        {statusCards[status]}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm font-Quattrocento_Sans">
          &copy; {new Date().getFullYear()} Teknolojik Yemekler. Tüm hakları
          saklıdır.
        </div>
      </div>
    </div>
  );
}
