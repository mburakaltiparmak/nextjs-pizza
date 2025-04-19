"use client";

import { useState, useCallback } from "react";
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
} from "lucide-react";

// LogoutHandler ayrı bir bileşene taşındı
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

  // Sidebar durumunu değiştir
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Sayfa yönlendirmesi
  const navigateTo = useCallback((path) => {
    setIsNavigating(false);
    router.push(path);
  }, [router]);

  // Çıkış işlemi başladığında çağrılacak
  const handleLogoutStart = useCallback(() => {
    setIsNavigating(true);
  }, []);

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
    <div
      className={`bg-red text-white border-r shadow-sm transition-all duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="p-4 flex justify-between items-center border-b border-red-700">
        {!collapsed && (
          <button
            onClick={() => navigateTo("/")}
            disabled={isNavigating}
            className="text-xl font-bold font-Barlow text-white"
          >
            Pizza Admin
          </button>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-red-700 text-white"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="p-3">
        <ul className="space-y-2 font-Barlow">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => navigateTo(item.path)}
                disabled={isNavigating}
                className={`flex items-center w-full p-3 rounded-lg ${
                  activePage === item.id
                    ? "bg-yellow text-black"
                    : "text-white hover:bg-yellow hover:text-black"
                } border border-red font-medium ${isNavigating ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {item.icon}
                {!collapsed && <span>{item.name}</span>}
              </button>
              <hr className="border-red-700" />
            </li>
          ))}

          <li className="mt-6">
            <LogoutButton collapsed={collapsed} onLogoutStart={handleLogoutStart} />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;