"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "@/lib/store/actions/categoryActions";
import { fetchDashboard } from "@/lib/store/actions/adminActions";
import { fetchStates } from "@/lib/store/constants";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ListOrdered, Package, TrendingUp, Users } from 'lucide-react';

// Components
import StatCard from "@/components/admin/statCard";
import SecondaryLoading from "@/components/secondaryLoading";

const DashboardPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Redux durumunu alalım
  const categories = useSelector((state) => state.category.categories);
  const categoryFetchState = useSelector((state) => state.category.fetchState);
  const dashboardData = useSelector((state) => state.admin.dashboardData);
  const adminFetchState = useSelector((state) => state.admin.fetchState);
  const loading = useSelector((state) => state.global.loading);
  
  // Veri yükleme başarısız olduğunda tekrar denemek için state
  const [dataFetchAttempted, setDataFetchAttempted] = useState(false);
  
  // İstatistikler
  const statistics = useMemo(() => {
    // Önce dashboard verilerini kullan, varsa
    if (dashboardData) {
      return {
        totalCategories: dashboardData.totalCategories || 0,
        totalProducts: dashboardData.totalProducts || 0,
        totalStock: dashboardData.totalStock || 0,
        totalUsers: dashboardData.totalUsers || 0,
        categoryData: dashboardData.categoryData || []
      };
    }
    
    // Yoksa kategorilerden hesapla
    if (!categories || !Array.isArray(categories)) {
      return { totalCategories: 0, totalProducts: 0, totalStock: 0, totalUsers: 0, categoryData: [] };
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
      totalUsers: 0, // Backend'den gelmediği için varsayılan değer
      categoryData
    };
  }, [categories, dashboardData]);

  // Verileri yükle
  useEffect(() => {
    // Admin dashboard verilerini getir
    if (adminFetchState === fetchStates.NOT_FETCHED && !dataFetchAttempted) {
      setDataFetchAttempted(true);
      dispatch(fetchDashboard()).catch(() => {
        // Hata durumunda en azından kategorileri getir
        if (categoryFetchState === fetchStates.NOT_FETCHED) {
          dispatch(fetchCategories());
        }
      });
    } 
    // Eğer dashboard verileri alınamadıysa, kategorileri getir
    else if (adminFetchState === fetchStates.FAILED && categoryFetchState === fetchStates.NOT_FETCHED) {
      dispatch(fetchCategories());
    }
  }, [dispatch, adminFetchState, categoryFetchState, dataFetchAttempted]);

  // Yükleniyor durumu
  if ((adminFetchState === fetchStates.FETCHING || categoryFetchState === fetchStates.FETCHING) && !dashboardData && !categories.length) {
    return <SecondaryLoading size="fullPage" />;
  }

  return (
    <div>
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Toplam Kategori"
          value={statistics.totalCategories}
          unit="Kategori"
          icon={<ListOrdered size={20} />}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />

        <StatCard
          title="Toplam Ürün"
          value={statistics.totalProducts}
          unit="Ürün"
          icon={<Package size={20} />}
          bgColor="bg-green-50"
          textColor="text-green-600"
        />

        <StatCard
          title="Toplam Stok"
          value={statistics.totalStock}
          unit="Adet"
          icon={<TrendingUp size={20} />}
          bgColor="bg-purple-50"
          textColor="text-purple-600"
        />
        
        <StatCard
          title="Toplam Kullanıcı"
          value={statistics.totalUsers}
          unit="Kullanıcı"
          icon={<Users size={20} />}
          bgColor="bg-red-50"
          textColor="text-red"
        />
      </div>

      {/* Grafik Bölümü */}
      {statistics.categoryData && statistics.categoryData.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-darkgray mb-4 font-Quattrocento_Sans">Kategori Analizi</h3>
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
                <Bar dataKey="ürünSayısı" fill="#CE2829" name="Ürün Sayısı" />
                <Bar dataKey="stokMiktarı" fill="#FDC913" name="Stok Miktarı" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8 text-center text-gray">
          <p className="py-4 font-Barlow">Henüz kategori ve ürün verisi bulunmamaktadır.</p>
        </div>
      )}

      {/* Kategori Listesi */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-darkgray font-Quattrocento_Sans">Kategoriler</h3>
        </div>
        {statistics.categoryData && statistics.categoryData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow">
                    Kategori Adı
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow">
                    Ürün Sayısı
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-Barlow">
                    Toplam Stok
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statistics.categoryData.map((category, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-darkgray font-Barlow">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray font-Barlow">
                      {category.ürünSayısı}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray font-Barlow">
                      {category.stokMiktarı}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray font-Barlow">
            <p>Henüz kategori bulunmamaktadır.</p>
            <button 
              onClick={() => router.push("/category")}
              className="mt-4 bg-red text-lightgray px-4 py-2 rounded-md hover:bg-yellow hover:text-red transition-colors duration-300 font-Barlow"
            >
              Kategori Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;