/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  login,
  checkAuthStatus,
  initiateGoogleLogin,
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
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import SecondaryLoading from "@/components/secondaryLoading";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { AUTH_ERRORS } from "@/lib/authErrorMessages"; // güvenli hata mesajları için

const FloatingUserButton = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const router = useRouter();

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
  const dropdownRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMeState] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // "Beni hatırla" durumunu localStorage'dan al (ilk yükleme sırasında)
  useEffect(() => {
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";
    setRememberMeState(savedRememberMe);
  }, []);

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
    e.preventDefault();

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

        // rememberMe durumunu sıfırlama - kullanıcının tercihini koru
        // setRememberMeState(false);
      }
    } catch (err) {
      // Asla ham hataları gösterme, her zaman güvenli bir mesaj kullan
      console.error("Login error:", err);
      setErrorMessage(AUTH_ERRORS.LOGIN_FAILED);
    }
  };

  // Google ile giriş yapmak için
  const handleGoogleLogin = () => {
    // Google girişine başlamadan önce rememberMe tercihini localStorage'a kaydet
    localStorage.setItem("tempRememberMe", rememberMe ? "true" : "false");
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
            className="bg-yellow z-50 p-3 font-Londrina_Solid text-red ring-2 ring-inset ring-white rounded-full shadow-lg hover:bg-red hover:text-yellow  transition-all duration-200 cursor-pointer flex items-center gap-2 text-base font-normal"
          >
            <FontAwesomeIcon icon={faUser} />
            <span>{name}</span>
          </div>

          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg overflow-hidden z-20 font-Barlow">
              <div className="py-2 border-b border-red">
                <div className="px-4 py-2">
                  <div className="font-bold truncate font-Londrina_Solid text-red">
                    {name}
                  </div>
                </div>
              </div>

              <div className="py-1">
                <div
                  className="px-4 py-2 hover:bg-lightgray cursor-pointer flex items-center text-darkgray text-sm"
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
                    className="px-4 py-2 hover:bg-lightgray cursor-pointer flex items-center text-darkgray text-sm"
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
                    className="px-4 py-2 hover:bg-lightgray cursor-pointer flex items-center text-darkgray text-sm"
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
                  className={`px-4 py-2 hover:bg-lightgray cursor-pointer flex items-center text-red text-sm ${
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
        <div className="flex gap-2 items-center">
          <AlertDialog open={loginOpen} onOpenChange={setLoginOpen}>
            <AlertDialogTrigger asChild>
              <Button className="bg-yellow text-red hover:bg-red hover:text-yellow ring-2 ring-inset ring-white rounded-full font-Barlow font-bold text-sm ">
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                <span>Giriş</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white p-0 border-0 rounded-md max-w-md">
              <div className="w-full max-w-md space-y-4 border-transparent rounded-md p-16">
                <AlertDialogHeader>
                  <AlertDialogTitle className="mt-6 text-center text-3xl font-bold tracking-tight font-Barlow text-red">
                    Giriş Yap
                  </AlertDialogTitle>
                  {/* AlertDialogDescription eklendi - erişilebilirlik hatası için */}
                  <AlertDialogDescription className="text-center text-black font-Barlow">
                    Hesabınıza giriş yapmak için bilgilerinizi giriniz.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                {errorMessage && (
                  <div className="font-Barlow rounded-md bg-red p-4">
                    <div className="text-sm text-lightgray">{errorMessage}</div>
                  </div>
                )}

                <form
                  className="mt-8 space-y-6 font-Quattrocento_Sans"
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
                      <label
                        htmlFor="remember-me"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Beni Hatırla
                      </label>
                    </div>
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

                    {/* Google ile giriş butonu */}
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
                      className="group relative flex w-full justify-center rounded-md border border-transparent px-3 py-2 text-sm font-semibold text-darkred bg-yellow hover:bg-lightyellow"
                    >
                      <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                      Üye Ol
                    </button>
                  </div>
                </form>
              </div>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            className="bg-lightgray text-red hover:bg-red hover:text-lightgray ring-2 ring-inset ring-lightgray rounded-full font-Barlow font-bold text-sm "
            onClick={() => router.push("/signup")}
          >
            <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
            <span>Üye Ol</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default FloatingUserButton;
