"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "@/lib/store/actions/categoryActions";
import {
  fetchAllUsers,
  fetchDashboard,
} from "@/lib/store/actions/adminActions";
import { fetchStates } from "@/lib/store/constants";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ListOrdered, Package, TrendingUp, Users } from "lucide-react";

// Components
import StatCard from "@/components/admin/statCard";
import SecondaryLoading from "@/components/secondaryLoading";

// Custom data loading hook
const useDashboardDataLoader = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Function to load dashboard data with retry logic
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // First attempt to get dashboard data (optimized call)
      try {
        await dispatch(fetchDashboard());
        // If successful, we already have all the data we need
        return true;
      } catch (dashboardError) {
        console.warn(
          "Dashboard API failed, falling back to individual data calls:",
          dashboardError
        );
        // If fetchDashboard fails, we'll continue with individual calls
      }

      // Load both categories and users in parallel as fallback
      const results = await Promise.allSettled([
        dispatch(fetchCategories()),
        dispatch(fetchAllUsers()),
      ]);

      // Check for partial failures
      const failures = results.filter((r) => r.status === "rejected");
      if (failures.length > 0) {
        console.warn("Some data requests failed:", failures);
        if (failures.length < results.length) {
          // Some succeeded, return true with warning
          console.log("Partial data loaded successfully");
          return true;
        } else {
          // All failed, throw error to trigger retry
          throw new Error("All data requests failed");
        }
      }

      return true;
    } catch (error) {
      console.error("Dashboard data loading error:", error);

      // Determine if we should retry
      const isNetworkError =
        error.message === "Network Error" ||
        error.name === "NetworkError" ||
        !navigator.onLine;

      if (isNetworkError && retryCount < MAX_RETRIES) {
        const nextRetry = retryCount + 1;
        setRetryCount(nextRetry);

        // Exponential backoff
        const backoffTime = Math.pow(2, retryCount) * 1000;
        console.log(
          `Retrying dashboard data load in ${
            backoffTime / 1000
          }s (${nextRetry}/${MAX_RETRIES})`
        );

        // Wait and retry
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
        return loadDashboardData();
      }

      // Max retries or non-network error
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    loadDashboardData,
    retryCount,
  };
};

const DashboardPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  // Redux state
  const categories = useSelector((state) => state.category.categories);
  const categoryFetchState = useSelector((state) => state.category.fetchState);
  const dashboardData = useSelector((state) => state.admin.dashboardData);
  const adminFetchState = useSelector((state) => state.admin.fetchState);
  const allUsers = useSelector((state) => state.admin.allUsers);
  const globalLoading = useSelector((state) => state.global.loading);

  // Use our custom data loader
  const {
    loading: dataLoading,
    error: dataError,
    loadDashboardData,
  } = useDashboardDataLoader();
  const [dataInitialized, setDataInitialized] = useState(false);

  // İstatistikler
  const statistics = useMemo(() => {
    // Önce dashboard verilerini kullan, varsa
    if (dashboardData) {
      return {
        totalCategories: dashboardData.totalCategories || 0,
        totalProducts: dashboardData.totalProducts || 0,
        totalStock: dashboardData.totalStock || 0,
        totalUsers: dashboardData.totalUsers || allUsers?.length || 0,
        categoryData: dashboardData.categoryData || [],
      };
    }

    // Yoksa kategorilerden ve kullanıcılardan hesapla
    if (!categories || !Array.isArray(categories)) {
      return {
        totalCategories: 0,
        totalProducts: 0,
        totalStock: 0,
        totalUsers: allUsers?.length || 0,
        categoryData: [],
      };
    }

    let totalProducts = 0;
    let totalStock = 0;
    let categoryData = [];

    categories.forEach((category) => {
      if (category.products && Array.isArray(category.products)) {
        const productCount = category.products.length;
        totalProducts += productCount;

        let categoryStock = 0;
        category.products.forEach((product) => {
          categoryStock += product.stock || 0;
        });

        totalStock += categoryStock;

        // Kategori verilerini grafik için hazırla
        categoryData.push({
          name: category.name,
          ürünSayısı: productCount,
          stokMiktarı: categoryStock,
        });
      }
    });

    return {
      totalCategories: categories.length,
      totalProducts,
      totalStock,
      totalUsers: allUsers?.length || 0,
      categoryData,
    };
  }, [categories, dashboardData, allUsers]);

  // Initialize data load
  useEffect(() => {
    if (!dataInitialized) {
      setDataInitialized(true);
      loadDashboardData();
    }
  }, [dataInitialized, loadDashboardData]);

  // Handle reload on error
  const handleRetryLoad = async () => {
    await loadDashboardData();
  };

  // Component props
  DashboardPage.props = {
    title: "Dashboard",
    activePage: "dashboard",
    showAddButton: false,
  };

  // Loading state
  if (dataLoading || globalLoading) {
    return <SecondaryLoading size="fullPage" />;
  }

  return (
    <div>
      {/* Data load error notification */}
      {dataError && (
        <div className="bg-red-50 text-red border border-red-200 p-4 mb-6 rounded-lg">
          <p className="font-Barlow font-semibold">
            Veri yüklenirken bir hata oluştu.
          </p>
          <p className="font-Barlow text-sm mb-2">
            Bazı veriler eksik veya güncel olmayabilir.
          </p>
          <button
            onClick={handleRetryLoad}
            className="bg-red hover:bg-red-700 text-white py-1 px-3 rounded text-sm transition-colors duration-300"
          >
            Yeniden Dene
          </button>
        </div>
      )}

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
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray mb-8">
          <h3 className="text-lg font-semibold text-darkgray mb-4 font-Quattrocento_Sans">
            Kategori Analizi
          </h3>
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
                <Bar dataKey="ürünSayısı" fill="#EB000B" name="Ürün Sayısı" />
                <Bar dataKey="stokMiktarı" fill="#FDC913" name="Stok Miktarı" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-lightgray mb-8 text-center text-gray">
          <p className="py-4 font-Barlow">
            Henüz kategori ve ürün verisi bulunmamaktadır.
          </p>
        </div>
      )}

      {/* Kategori Listesi */}
      <div className="bg-white rounded-xl shadow-sm border border-lightgray">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-darkgray font-Quattrocento_Sans">
            Kategoriler
          </h3>
        </div>
        {statistics.categoryData && statistics.categoryData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray">
              <thead className="bg-lightgray">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray uppercase tracking-wider font-Barlow"
                  >
                    Kategori Adı
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray uppercase tracking-wider font-Barlow"
                  >
                    Ürün Sayısı
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray uppercase tracking-wider font-Barlow"
                  >
                    Toplam Stok
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray">
                {statistics.categoryData.map((category, index) => (
                  <tr key={index} className="hover:bg-lightgray">
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
