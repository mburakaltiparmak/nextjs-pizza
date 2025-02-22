"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
const Page = () => {
  const router = useRouter();
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalStock, setTotalStock] = useState(0);

  const handleLogout = (e) => {
    e.preventDefault();
    router.push("/login");
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-2.5 fixed left-0 right-0 top-0 z-50">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex justify-start items-center">
            <span className="text-xl font-bold">Admin Panel</span>
          </div>
          <div className="flex items-center lg:order-2">
            <button
              onClick={handleLogout}
              className="text-white bg-red-500 hover:bg-red-600 font-medium rounded-lg text-sm px-4 py-2"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className="fixed left-0 top-16 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0">
        <div className="h-full px-3 py-4 overflow-y-auto bg-white border-r border-gray-200">
          <ul className="space-y-2 font-medium">
            <li>
              <a
                href="/admin/dashboard"
                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 bg-gray-200"
              >
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a
                href="/admin/categories"
                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <span>Kategoriler</span>
              </a>
            </li>
            <li>
              <a
                href="/admin/products"
                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <span>Ürünler</span>
              </a>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <div className="p-4 sm:ml-64">
        <div className="p-4 border-2 border-gray-200 rounded-lg mt-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-xl font-bold mb-2">Toplam Kategori</h3>
              <p className="text-3xl">{totalCategories}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-xl font-bold mb-2">Toplam Ürün</h3>
              <p className="text-3xl">{totalProducts}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-xl font-bold mb-2">Toplam Stok</h3>
              <p className="text-3xl">{totalStock}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
