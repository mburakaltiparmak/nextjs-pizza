/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, logout, checkAuthStatus } from "@/lib/store/actions/userActions";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignOutAlt, faUserPlus, faUserEdit, faShoppingBag, faUserTie } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import SecondaryLoading from "@/components/secondaryLoading";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AUTH_ERRORS } from "@/lib/authErrorMessages"; // güvenli hata mesajları için

const FloatingUserButton = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const router = useRouter();
  
  // Redux state
  const isLogin = useSelector((state) => state.user.isLogin);
  const email = useSelector((state) => state.user.email);
  const loading = useSelector((state) => state.global.loading);
  const role = useSelector((state) => state.user.role);
  console.log("user role:", role);
  
  // Local state
  const [loginOpen, setLoginOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMeState] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Form alanlarını doğrula
    if (!validateForm()) {
      return;
    }

    const formData = {
      email: username,
      password: password,
      rememberMe: rememberMe
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
        setUsername("");
        setPassword("");
        setRememberMeState(false);
      }
    } catch (err) {
      // Asla ham hataları gösterme, her zaman güvenli bir mesaj kullan
      console.error("Login error:", err);
      setErrorMessage(AUTH_ERRORS.LOGIN_FAILED);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
    
    // Çıkış yaparken localStorage'dan userEmail'i de kaldır
    localStorage.removeItem("userEmail");
    
    toast({
      title: "Çıkış yapıldı",
      description: "Başarıyla çıkış yaptınız.",
    });
  };

  return (
    <div className="flex items-center">
      {isLogin ? (
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="bg-lightgray z-50 p-3 text-darkgray border-2 border-darkgray 2 rounded-full hover:bg-yellow hover:text-red hover:border-2 hover:border-darkgray transition-colors duration-200 cursor-pointer flex items-center gap-2 text-base font-normal"
          >
            <FontAwesomeIcon icon={faUser} />
            <span className="hidden sm:inline">{email}</span>
          </div>
          
          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg overflow-hidden z-20">
              <div className="py-2 border-b border-red">
                <div className="px-4 py-2">
                  <div className="font-bold truncate text-red">{email}</div>
                  <div className="text-sm text-gray">Hesabım</div>
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
                  className="px-4 py-2 hover:bg-lightgray cursor-pointer flex items-center text-red text-sm"
                  onClick={handleLogout}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                  <span>Çıkış Yap</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2 items-center">
          <AlertDialog open={loginOpen} onOpenChange={setLoginOpen}>
            <AlertDialogTrigger asChild>
              <Button className="bg-blue-950 text-lightgray hover:bg-lightgray hover:text-blue-950 hover:border-blue-950 text-sm py-1 h-auto">
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
                </AlertDialogHeader>

                {errorMessage && (
                  <div className="font-Barlow rounded-md bg-red p-4">
                    <div className="text-sm text-lightgray">{errorMessage}</div>
                  </div>
                )}

                <form className="mt-8 space-y-6 font-Quattrocento_Sans" onSubmit={handleLogin}>
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

                  <div className="flex flex-col space-y-2">
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
                    
                    <button
                      type="button"
                      onClick={() => {
                        setLoginOpen(false);
                        router.push("/signup");
                      }}
                      className="group relative flex w-full justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
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
            className="bg-green-600 text-lightgray hover:bg-lightgray hover:text-green-600 hover:border-green-600 text-sm py-1 h-auto"
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