"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronRight, 
  ChevronLeft, 
  LayoutDashboard, 
  Package, 
  ListOrdered, 
  LogOut,
  ShoppingCart,
} from 'lucide-react';

const Sidebar = ({ activePage = 'dashboard' }) => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = (e) => {
    
    localStorage.removeItem("token");
    router.push("/login");
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
      path: '/dashboard',
      name: 'Dashboard',
      icon: <LayoutDashboard className={`${collapsed ? 'mx-auto' : 'mr-3'}`} size={20} />,
      id: 'dashboard'
    },
    {
      path: '/category',
      name: 'Kategoriler',
      icon: <ListOrdered className={`${collapsed ? 'mx-auto' : 'mr-3'}`} size={20} />,
      id: 'category'
    },
    {
      path: '/product',
      name: 'Ürünler',
      icon: <Package className={`${collapsed ? 'mx-auto' : 'mr-3'}`} size={20} />,
      id: 'product'
    },
    {
      path: '/orders',
      name: 'Siparişler',
      icon: <ShoppingCart className={`${collapsed ? 'mx-auto' : 'mr-3'}`} size={20} />,
      id: 'orders'
    }
  ];

  return (
    <div className={`bg-red text-white border-r shadow-sm transition-all duration-300 ease-in-out ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-4 flex justify-between items-center border-b border-red-700">
        {!collapsed && <span className="text-xl font-bold font-Barlow text-white">Pizza Admin</span>}
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
                    ? 'bg-yellow text-black' 
                    : 'text-white hover:bg-yellow hover:text-black'
                } border border-red font-medium`}
              >
                {item.icon}
                {!collapsed && <span>{item.name}</span>}
              </button>
              <hr className="border-red-700"/>
            </li>
          ))}
          
          <li className="mt-6">
            <button 
              onClick={handleLogout}
              className="flex items-center w-full p-3 rounded-lg text-white hover:bg-yellow hover:text-black border border-red font-medium"
            >
              <LogOut className={`${collapsed ? 'mx-auto' : 'mr-3'}`} size={20} />
              {!collapsed && <span>Çıkış Yap</span>}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;