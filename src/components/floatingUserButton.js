/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  login,
  checkAuthStatus,
  initiateGoogleLogin,
  forgotPassword,
} from "@/lib/store/actions/userActions";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faSignOutAlt,
  faUserPlus,
  faUserEdit,
  faShoppingBag,
  faUserTie,
  faGoogle,
  faTimes,
  faKey,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { AUTH_ERRORS } from "@/lib/authErrorMessages";
import Loading from "@/app/loading";
import useAuth from "@/hooks/use-auth";
import SecondaryLoading from "./secondaryLoading";

const FloatingUserButton = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const router = useRouter();
  const {
    isAuthenticated,
    loading: authLoading,
    refreshAuth,
  } = useAuth([], "/", false);

  // Redux state
  const isLogin = useSelector((state) => state.user.isLogin);
  const userEmail = useSelector((state) => state.user.email);
  const name = useSelector((state) => state.user.profile?.name);
  const loading = useSelector((state) => state.global.loading);
  const role = useSelector((state) => state.user.role);
  const authProvider = useSelector((state) => state.user.authProvider);
  const storedRememberMe = useSelector((state) => state.user.rememberMe);

  // Local state
  const [loginOpen, setLoginOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [rememberMe, setRememberMeState] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

  // "Beni hatırla" durumunu localStorage'dan al (ilk yükleme sırasında)
  useEffect(() => {
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";
    setRememberMeState(savedRememberMe);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add event listener for resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        if (loginOpen) setLoginOpen(false);
        if (forgotPasswordOpen) setForgotPasswordOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [loginOpen, forgotPasswordOpen]);

  // Kullanıcının admin veya personel olup olmadığını kontrol et
  const isAdminOrPersonal = role === "ADMIN" || role === "PERSONAL";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check auth status when component mounts
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  const handleInputChange = () => {
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const validateForm = () => {
    // Form doğrulama
    if (!email.trim()) {
      setErrorMessage("Email gereklidir");
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

  const handleLogin = async (e) => {
    e && e.preventDefault();

    // Form alanlarını doğrula
    if (!validateForm()) {
      return;
    }

    const formData = {
      username: email,
      password: password,
      rememberMe: rememberMe,
    };

    try {
      const result = await dispatch(login(formData));

      if (result && result.error) {
        // Güvenli bir hata mesajı kullan
        setErrorMessage(AUTH_ERRORS.INVALID_CREDENTIALS);
      } else {
        toast({
          title: "Giriş başarılı!",
          description: "Hoş geldiniz.",
        });

        setLoginOpen(false);
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage(AUTH_ERRORS.LOGIN_FAILED);
    }
  };

  // Şifremi unuttum işlemi
  const handleForgotPassword = async (e) => {
    e && e.preventDefault();
    setForgotPasswordError("");
    setForgotPasswordSuccess(false);

    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordError("Email adresi gereklidir");
      return;
    }

    try {
      const result = await dispatch(forgotPassword(forgotPasswordEmail));

      if (result && result.success) {
        setForgotPasswordSuccess(true);
        toast({
          title: "Başarılı",
          description:
            "Şifre sıfırlama bağlantısı email adresinize gönderildi.",
        });
      } else if (result && result.error) {
        setForgotPasswordError(result.error);
      }
    } catch (err) {
      console.error("Şifre sıfırlama hatası:", err);
      setForgotPasswordError(
        "Şifre sıfırlama işlemi sırasında bir hata oluştu"
      );
    }
  };

  // Google ile giriş yapmak için
  const handleGoogleLogin = () => {
    // Google girişine başlamadan önce rememberMe tercihini localStorage'a kaydet
    localStorage.setItem("rememberMe", rememberMe ? "true" : "false");
    dispatch(initiateGoogleLogin());
    setLoginOpen(false);
  };

  const handleLogout = async () => {
    try {
      // Çıkış yapılıyor durumunu ayarla
      setIsLoggingOut(true);

      // Redux action'ını import etmek yerine dynamically import et
      const userActions = await import("@/lib/store/actions/userActions");

      // Dispatch logout action
      await dispatch(userActions.logout());

      setDropdownOpen(false);

      toast({
        title: "Çıkış yapıldı",
        description: "Başarıyla çıkış yaptınız.",
      });

      // Yönlendirmeyi geciktir
      setTimeout(() => {
        router.push("/");
      }, 100);
    } catch (error) {
      console.error("Çıkış yapma hatası:", error);

      toast({
        title: "Hata",
        description: "Çıkış yapılırken bir sorun oluştu.",
        variant: "destructive",
      });

      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex items-center">
      {isLogin ? (
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="bg-yellow z-100 p-3 max-md:fixed max-md:top-2 max-md:text-xs max-md:gap-1 font-Londrina_Solid text-red ring-2 ring-inset ring-black rounded-lg shadow-lg hover:bg-black hover:ring-yellow hover:text-yellow  transition-all duration-200 cursor-pointer flex items-center gap-2 text-base font-normal"
          >
            <FontAwesomeIcon icon={faUser} />
          </div>

          {dropdownOpen && (
            <div className="absolute left-0 mt-2 max-md:mt-8 max-md:text-sm w-56 bg-white rounded-md shadow-lg overflow-hidden z-20 font-Barlow">
              <div className="py-2 border-b border-red">
                <div className="px-4 py-2">
                  <div className="font-bold truncate font-Londrina_Solid text-red max-md:text-lg">
                    {name ? name : userEmail}
                  </div>
                  <div className="text-gray-600 text-xs truncate">
                    {userEmail}
                  </div>
                </div>
              </div>

              <div className="py-1">
                <div
                  className="px-4 py-2 hover:bg-lightgray cursor-pointer flex items-center text-darkgray text-sm max-md:text-xs "
                  onClick={() => {
                    router.push("/profile");
                    setDropdownOpen(false);
                  }}
                >
                  <FontAwesomeIcon icon={faUserEdit} className="mr-2" />
                  <span>Profil Bilgilerim</span>
                </div>

                {isAdminOrPersonal ? (
                  <div
                    className="px-4 py-2 hover:bg-lightgray cursor-pointer flex items-center text-darkgray text-sm max-md:text-xs"
                    onClick={() => {
                      router.push("/dashboard");
                      setDropdownOpen(false);
                    }}
                  >
                    <FontAwesomeIcon icon={faUserTie} className="mr-2" />
                    <span>Admin Panel</span>
                  </div>
                ) : (
                  <div
                    className="px-4 py-2 hover:bg-lightgray cursor-pointer flex items-center text-darkgray text-sm max-md:text-xs"
                    onClick={() => {
                      router.push("/orders");
                      setDropdownOpen(false);
                    }}
                  >
                    <FontAwesomeIcon icon={faShoppingBag} className="mr-2" />
                    <span>Siparişlerim</span>
                  </div>
                )}
              </div>

              <div className="py-1 border-t border-red">
                <div
                  className={`px-4 py-2 hover:bg-lightgray cursor-pointer flex items-center text-red text-sm max-md:text-xs ${
                    isLoggingOut ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  onClick={!isLoggingOut ? handleLogout : undefined}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                  <span>
                    {isLoggingOut ? "Çıkış Yapılıyor..." : "Çıkış Yap"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2 items-center max-md:items-start max-md:flex-col max-md:fixed max-md:z-100 max-md:top-2">
          {/* Giriş Modalı */}
          <AlertDialog open={loginOpen} onOpenChange={setLoginOpen}>
            <AlertDialogTrigger asChild>
              <button className="h-10 max-md:h-8 max-md:w-16 max-md:text-xs max-md:gap-1 px-4 py-2 bg-yellow text-red hover:bg-black hover:text-yellow ring-2 ring-inset ring-white rounded-lg font-Barlow font-bold text-sm inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:bg-opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95">
                <FontAwesomeIcon icon={faUser} className="mr-2 max-md:mr-0" />
                <span className="">Giriş</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-red p-0 border-0 rounded-md max-w-md">
              <div className="w-full max-w-md space-y-4 border-transparent rounded-md p-16 relative">
                {/* Kapat butonu */}
                <button
                  onClick={() => setLoginOpen(false)}
                  className="absolute right-4 top-4 rounded-full px-2 py-1 ring-2 ring-inset ring-white text-red transition-colors bg-yellow hover:bg-black hover:text-yellow hover:ring-yellow hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                </button>

                <AlertDialogHeader>
                  <AlertDialogTitle className="mt-6 text-center text-3xl font-bold tracking-tight font-Barlow text-white">
                    Giriş
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-center text-white font-Barlow text-sm">
                    Hesabınıza giriş yapmak için bilgilerinizi giriniz.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                {errorMessage && (
                  <div className="font-Barlow rounded-md bg-red p-4">
                    <div className="text-sm text-lightgray">{errorMessage}</div>
                  </div>
                )}

                <form
                  className="mt-8 space-y-3 font-Quattrocento_Sans"
                  onSubmit={handleLogin}
                >
                  <div className="-space-y-px rounded-md shadow-sm">
                    <div>
                      <label htmlFor="email" className="sr-only">
                        Email
                      </label>
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
                        placeholder="Şifreniz"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          handleInputChange();
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-2 py-1 text-white">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        disabled={loading}
                        className="h-4 w-4 rounded border-black text-red focus:ring-red"
                        checked={rememberMe}
                        onChange={(e) => setRememberMeState(e.target.checked)}
                      />
                      <label
                        htmlFor="remember-me"
                        className="ml-2 block text-sm font-semibold"
                      >
                        Beni Hatırla
                      </label>
                    </div>
                    <div className="text-sm">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginOpen(false);
                          setForgotPasswordOpen(true);
                          setForgotPasswordEmail(email);
                        }}
                        className="font-semibold text-white hover:text-yellow"
                      >
                        Şifremi Unuttum
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`group relative flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white hover:shadow-lg hover:scale-105 active:scale-95 ${
                        loading
                          ? "bg-red cursor-not-allowed"
                          : "bg-green-800 hover:bg-green-600"
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <SecondaryLoading size="medium" />
                        </div>
                      ) : (
                        "Giriş Yap"
                      )}
                    </button>

                    {/* Google ile giriş butonu */}
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="group relative flex w-full justify-center items-center rounded-md border border-black px-3 py-2 text-sm font-semibold bg-white text-red hover:border-white hover:bg-red hover:text-white hover:shadow-lg hover:scale-105 active:scale-95"
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
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                        <path fill="none" d="M1 1h22v22H1z" />
                      </svg>
                      Google ile Giriş Yap
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLoginOpen(false);
                        router.push("/signup");
                      }}
                      className="group relative flex w-full justify-center rounded-md border border-transparent px-3 py-2 text-sm font-semibold text-darkred bg-yellow hover:bg-lightyellow hover:shadow-lg hover:scale-105 active:scale-95"
                    >
                      <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                      Üye Ol
                    </button>
                  </div>
                </form>
              </div>
            </AlertDialogContent>
          </AlertDialog>

          {/* Şifremi Unuttum Modalı */}
          <AlertDialog
            open={forgotPasswordOpen}
            onOpenChange={setForgotPasswordOpen}
          >
            <AlertDialogContent className="bg-red p-0 border-0 rounded-md max-w-md">
              <div className="w-full max-w-md space-y-4 border-transparent rounded-md p-16 relative">
                <button
                  onClick={() => setForgotPasswordOpen(false)}
                  className="absolute right-4 top-4 rounded-full px-2 py-1 ring-2 ring-inset ring-white text-red transition-colors bg-yellow hover:bg-black hover:text-yellow hover:ring-yellow hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                </button>

                <AlertDialogHeader>
                  <AlertDialogTitle className="mt-6 text-center text-3xl font-bold tracking-tight font-Barlow text-white">
                    Şifremi Unuttum
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-center text-white font-Barlow text-sm">
                    {!forgotPasswordSuccess
                      ? "Şifre sıfırlama bağlantısı için email adresinizi girin."
                      : "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi."}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                {forgotPasswordError && (
                  <div className="font-Barlow rounded-md bg-darkred p-4">
                    <div className="text-sm text-white">
                      {forgotPasswordError}
                    </div>
                  </div>
                )}

                {forgotPasswordSuccess ? (
                  <div className="space-y-4">
                    <div className="bg-green-700 p-4 rounded-md text-white text-center">
                      <FontAwesomeIcon icon={faKey} className="text-2xl mb-2" />
                      <p>
                        Şifre sıfırlama bağlantısı e-posta adresinize
                        gönderildi. Lütfen e-postanızı kontrol edin.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordOpen(false);
                        setForgotPasswordSuccess(false);
                        setLoginOpen(true);
                      }}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-darkred bg-yellow hover:bg-lightyellow hover:shadow-lg hover:scale-105 active:scale-95"
                    >
                      Giriş Ekranına Dön
                    </button>
                  </div>
                ) : (
                  <form
                    className="mt-8 space-y-4 font-Quattrocento_Sans"
                    onSubmit={handleForgotPassword}
                  >
                    <div>
                      <label htmlFor="forgotPasswordEmail" className="sr-only">
                        Email Adresi
                      </label>
                      <input
                        id="forgotPasswordEmail"
                        name="email"
                        type="email"
                        required
                        disabled={loading}
                        className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-red sm:text-sm sm:leading-6"
                        placeholder="Email adresiniz"
                        value={forgotPasswordEmail}
                        onChange={(e) => {
                          setForgotPasswordEmail(e.target.value);
                          setForgotPasswordError("");
                        }}
                      />
                    </div>

                    <div className="flex flex-col space-y-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`group relative flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white hover:shadow-lg hover:scale-105 active:scale-95 ${
                          loading
                            ? "bg-red cursor-not-allowed"
                            : "bg-green-800 hover:bg-green-600"
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
                        type="button"
                        onClick={() => {
                          setForgotPasswordOpen(false);
                          setLoginOpen(true);
                        }}
                        className="group relative flex w-full justify-center rounded-md border border-transparent px-3 py-2 text-sm font-semibold text-darkred bg-yellow hover:bg-lightyellow hover:shadow-lg hover:scale-105 active:scale-95"
                      >
                        Giriş Ekranına Dön
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </AlertDialogContent>
          </AlertDialog>

          <button
            className="h-10 max-md:w-16 max-md:text-xs max-md:h-8 px-4 py-2 bg-white gap-1 text-red hover:bg-black hover:text-yellow ring-2 ring-inset ring-yellow hover:ring-white rounded-lg font-Barlow font-bold text-sm inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:bg-opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95"
            onClick={() => router.push("/signup")}
          >
            <FontAwesomeIcon icon={faUserPlus} className="mr-2 max-md:mr-0" />
            <span className="">Üye Ol</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FloatingUserButton;
