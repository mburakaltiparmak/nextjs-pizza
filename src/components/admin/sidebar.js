"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks";
import {
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  Package,
  ListOrdered,
  LogOut,
  ShoppingCart,
  User,
  Menu,
  X
} from "lucide-react";
import { Separator } from "../ui/separator";

// LogoutHandler bileşeni aynı
const LogoutButton = ({ collapsed, onLogoutStart }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = useCallback(async () => {
    // Eğer zaten çıkış yapılıyorsa işlemi tekrarlama
    if (isLoggingOut) return;

    try {
      // Logout durumunu işaretle
      setIsLoggingOut(true);
      
      // Parent bileşene bildir
      if (onLogoutStart) {
        onLogoutStart();
      }
      
      // Dynamic import kullanarak logout fonksiyonunu yükle
      const userActionsModule = await import('@/lib/store/actions/userActions');
      
      // Logout action'ını çağır
      await dispatch(userActionsModule.logout());
      
      // Çıkış başarılı - localStorage'ı temizle
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
      }
      
      // Kullanıcıyı login sayfasına yönlendir
      setTimeout(() => {
        router.push('/login');
      }, 100);
      
    } catch (error) {
      console.error("Çıkış yapma hatası:", error);
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, dispatch, router, onLogoutStart]);

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`flex items-center w-full p-3 rounded-lg text-white hover:bg-yellow hover:text-black border border-red font-medium ${
        isLoggingOut ? 'opacity-70 cursor-not-allowed' : ''
      }`}
    >
      <LogOut
        className={`${collapsed ? "mx-auto" : "mr-3"}`}
        size={20}
      />
      {!collapsed && <span>{isLoggingOut ? 'Çıkış Yapılıyor...' : 'Çıkış Yap'}</span>}
    </button>
  );
};

// Ana Sidebar bileşeni
const Sidebar = ({ activePage = "dashboard" }) => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Ekran boyutunu kontrol et
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Mobil cihazda sidebar'ı daralt
      if (mobile && !collapsed) {
        setCollapsed(true);
      }
    };
    
    // İlk kontrol
    checkMobile();
    
    // Resize olayını dinle
    window.addEventListener('resize', checkMobile);
    
    // Temizleme
    return () => window.removeEventListener('resize', checkMobile);
  }, [collapsed]);

  // Sidebar durumunu değiştir
  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  // Sayfa yönlendirmesi
  const navigateTo = useCallback((path) => {
    setIsNavigating(true);
    if (isMobile) {
      setMobileOpen(false);
    }
    router.push(path);
    setTimeout(() => {
      setIsNavigating(false);
    }, 300);
  }, [router, isMobile]);

  // Çıkış işlemi başladığında çağrılacak
  const handleLogoutStart = useCallback(() => {
    setIsNavigating(true);
  }, []);

  // Mobil görünümde dışarıya tıklandığında sidebar'ı kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById("sidebar-container");
      if (isMobile && mobileOpen && sidebar && !sidebar.contains(event.target)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile, mobileOpen]);

  // Menü öğeleri
  const menuItems = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: <LayoutDashboard className={`${collapsed ? "mx-auto" : "mr-3"}`} size={20} />,
      id: "dashboard",
    },
    {
      path: "/category",
      name: "Kategoriler",
      icon: <ListOrdered className={`${collapsed ? "mx-auto" : "mr-3"}`} size={20} />,
      id: "category",
    },
    {
      path: "/product",
      name: "Ürünler",
      icon: <Package className={`${collapsed ? "mx-auto" : "mr-3"}`} size={20} />,
      id: "product",
    },
    {
      path: "/orders",
      name: "Siparişler",
      icon: <ShoppingCart className={`${collapsed ? "mx-auto" : "mr-3"}`} size={20} />,
      id: "orders",
    },
    {
      path: "/users",
      name: "Kullanıcılar",
      icon: <User className={`${collapsed ? "mx-auto" : "mr-3"}`} size={20} />,
      id: "users",
    },
  ];

  return (
    <>
      {/* Mobil menü butonu */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-3 left-4 bg-red text-yellow z-50 p-2 ring-2 ring-inset ring-black text-darkred shadow-lg md:hidden"
          aria-label="Menüyü aç/kapat"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}
      
      {/* Sidebar */}
      <div
        id="sidebar-container"
        className={`bg-red text-white transition-all duration-300 ease-in-out 
          ${isMobile 
            ? `fixed inset-y-0 left-0 z-40 w-48 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
            : collapsed ? 'w-20' : 'w-48'
          }`}
      >
        <div className="p-4 flex justify-between items-center border-b border-red-700">
          {(!collapsed || (isMobile && mobileOpen)) && (
            <button
              onClick={() => navigateTo("/")}
              disabled={isNavigating}
              className="text-xl font-bold font-Barlow text-white"
            >
              Pizza Admin
            </button>
          )}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-red-700 text-white"
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          )}
        </div>

        <div className="py-3 w-full px-2">
          <ul className="flex flex-col items-start gap-1 font-Barlow w-full">
            {menuItems.map((item) => (
              <li className="space-y-1 w-full " key={item.id}>
                <button
                  onClick={() => navigateTo(item.path)}
                  disabled={isNavigating}
                  className={`flex flex-row gap-1 items-center justify-start rounded-xl p-3  w-full ${
                    activePage === item.id
                      ? "bg-yellow text-black"
                      : "text-white hover:bg-yellow hover:text-black"
                  } border border-red font-medium ${isNavigating ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                 <span>{item.icon}</span> 
                  {(!collapsed || (isMobile && mobileOpen)) && <span>{item.name}</span>}
                </button>
                <Separator orientation="horizontal" />
              </li>
            ))}

            <li className="w-full">
              <LogoutButton 
                collapsed={collapsed && !isMobile} 
                onLogoutStart={handleLogoutStart} 
              />
            </li>
          </ul>
        </div>
      </div>
      
      {/* Mobil overlay - sidebar açıldığında arkaplanı karartır */}
      {isMobile && mobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30" 
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;