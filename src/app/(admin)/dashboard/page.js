"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchCategoriesWithProducts } from "@/lib/store/actions/productActionsFromApi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ListOrdered, Package, TrendingUp } from 'lucide-react';

// Components
import StatCard from "@/components/admin/statCard";
const DashboardPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Redux durumunu alalım
  const categories = useAppSelector((state) => state.productAPI.categories);
  const loading = useAppSelector((state) => state.productAPI.loading);
  const error = useAppSelector((state) => state.productAPI.error);
  
  // İstatistikler
  const statistics = useMemo(() => {
    if (!categories || !Array.isArray(categories)) {
      return { totalCategories: 0, totalProducts: 0, totalStock: 0 };
    }
    
    let totalProducts = 0;
    let totalStock = 0;
    let categoryData = [];
    
    categories.forEach(category => {
      if (category.products && Array.isArray(category.products)) {
        const productCount = category.products.length;
        totalProducts += productCount;
        
        let categoryStock = 0;
        category.products.forEach(product => {
          categoryStock += product.stock || 0;
        });
        
        totalStock += categoryStock;
        
        // Kategori verilerini grafik için hazırla
        categoryData.push({
          name: category.name,
          ürünSayısı: productCount,
          stokMiktarı: categoryStock
        });
      }
    });
    
    return {
      totalCategories: categories.length,
      totalProducts,
      totalStock,
      categoryData
    };
  }, [categories]);

  useEffect(() => {
    dispatch(fetchCategoriesWithProducts());
  }, [dispatch]);

  return (
    <div>
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Toplam Kategori"
          value={statistics.totalCategories}
          unit="Kategori"
          icon={<ListOrdered size={20} />}
          bgColor="bg-blue-50"
          textColor="text-blue-500"
        />

        <StatCard
          title="Toplam Ürün"
          value={statistics.totalProducts}
          unit="Ürün"
          icon={<Package size={20} />}
          bgColor="bg-green-50"
          textColor="text-green-500"
        />

        <StatCard
          title="Toplam Stok"
          value={statistics.totalStock}
          unit="Adet"
          icon={<TrendingUp size={20} />}
          bgColor="bg-purple-50"
          textColor="text-purple-500"
        />
      </div>

      {/* Grafik Bölümü */}
      {statistics.categoryData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 font-Barlow">Kategori Analizi</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statistics.categoryData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ürünSayısı" fill="#4FD1C5" name="Ürün Sayısı" />
                <Bar dataKey="stokMiktarı" fill="#9F7AEA" name="Stok Miktarı" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Kategori Listesi */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800 font-Barlow">Kategoriler</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori Adı
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ürün Sayısı
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Toplam Stok
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {statistics.categoryData.map((category, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.ürünSayısı}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.stokMiktarı}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
  );
};

export default DashboardPage;