"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/lib/store/actions/userActions";
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
import { icon } from "@fortawesome/fontawesome-svg-core";

const Sidebar = ({ activePage = "dashboard" }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      // Redux logout action'ını dispatch et
      const result = await dispatch(logout());

      // Çıkış başarılı ise login sayfasına yönlendir
      if (result && result.success) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Çıkış yapılırken hata oluştu:", error);
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const navigateTo = (path) => {
    router.push(path);
  };

  // Menü öğelerini tanımlayalım
  const menuItems = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: (
        <LayoutDashboard
          className={`${collapsed ? "mx-auto" : "mr-3"}`}
          size={20}
        />
      ),
      id: "dashboard",
    },
    {
      path: "/category",
      name: "Kategoriler",
      icon: (
        <ListOrdered
          className={`${collapsed ? "mx-auto" : "mr-3"}`}
          size={20}
        />
      ),
      id: "category",
    },
    {
      path: "/product",
      name: "Ürünler",
      icon: (
        <Package className={`${collapsed ? "mx-auto" : "mr-3"}`} size={20} />
      ),
      id: "product",
    },
    {
      path: "/orders",
      name: "Siparişler",
      icon: (
        <ShoppingCart
          className={`${collapsed ? "mx-auto" : "mr-3"}`}
          size={20}
        />
      ),
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
          onClick={()=>router.push("/")}
          className="text-xl font-bold font-Barlow text-white">
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
                className={`flex items-center w-full p-3 rounded-lg ${
                  activePage === item.id
                    ? "bg-yellow text-black"
                    : "text-white hover:bg-yellow hover:text-black"
                } border border-red font-medium`}
              >
                {item.icon}
                {!collapsed && <span>{item.name}</span>}
              </button>
              <hr className="border-red-700" />
            </li>
          ))}

          <li className="mt-6">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 rounded-lg text-white hover:bg-yellow hover:text-black border border-red font-medium"
            >
              <LogOut
                className={`${collapsed ? "mx-auto" : "mr-3"}`}
                size={20}
              />
              {!collapsed && <span>Çıkış Yap</span>}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
