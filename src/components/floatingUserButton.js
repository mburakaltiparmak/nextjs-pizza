/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, logout, checkAuthStatus } from "@/lib/store/actions/userActions";
import { setError } from "@/lib/store/actions/globalActions";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignOutAlt, faUserPlus, faUserEdit, faShoppingBag } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";

const FloatingUserButton = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const router = useRouter();
  
  // Redux state
  const isLogin = useSelector((state) => state.user.isLogin);
  const email = useSelector((state) => state.user.email);
  const loading = useSelector((state) => state.global.loading);
  const error = useSelector((state) => state.global.error);
  
  // Local state
  const [loginOpen, setLoginOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

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

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      toast({
        title: "Hata",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const result = await dispatch(login(formData));
    
    if (!result || !result.error) {
      toast({
        title: "Giriş başarılı!",
        description: "Hoş geldiniz.",
      });
      
      setLoginOpen(false);
      setFormData({
        email: "",
        password: "",
        rememberMe: false
      });
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
    <div className="ml-auto flex items-center">
      {isLogin ? (
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="bg-lightgray text-darkgray border-2 border-darkgray px-3 py-2 rounded-md hover:bg-yellow hover:text-red hover:border-2 hover:border-darkgray transition-colors duration-200 cursor-pointer flex items-center gap-2 text-base font-normal"
          >
            <FontAwesomeIcon icon={faUser} />
            <span className="hidden sm:inline">{email}</span>
          </div>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg overflow-hidden z-20">
              <div className="py-2 border-b border-red">
                <div className="px-4 py-2">
                  <div className="font-bold truncate text-red">{email}</div>
                  <div className="text-sm text-gray">Hesabım</div>
                </div>
              </div>
              
              <div className="py-1">
                <div 
                  className="px-4 py-2 hover:bg-lightgray cursor-pointer flex items-center text-darkgray  text-sm"
                  onClick={() => {
                    router.push("/profile");
                    setDropdownOpen(false);
                  }}
                >
                  <FontAwesomeIcon icon={faUserEdit} className="mr-2" />
                  <span>Profil Bilgilerim</span>
                </div>
                
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
            <AlertDialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleLogin}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Giriş Yap</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hesabınıza giriş yaparak siparişlerinizi yönetin ve özel tekliflerden yararlanın.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      E-posta
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Şifre
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="col-span-4 flex items-center space-x-2">
                      <Checkbox 
                        id="rememberMe" 
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) => 
                          setFormData({...formData, rememberMe: checked})}
                      />
                      <label
                        htmlFor="rememberMe"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Beni hatırla
                      </label>
                    </div>
                  </div>
                </div>
                <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setLoginOpen(false);
                      router.push("/signup");
                    }}
                  >
                    <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                    Üye Ol
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                  </Button>
                </AlertDialogFooter>
              </form>
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