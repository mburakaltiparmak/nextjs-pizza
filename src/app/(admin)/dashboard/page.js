"use client";

import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useModuleState } from "@/hooks";
import SecondaryLoading from "@/components/secondaryLoading";
import {
  DashboardStatsGrid,
  DashboardChart,
  DashboardCategoriesTable,
  DashboardErrorBanner,
} from "@/components/dashboard";
import { useDashboardData } from "@/hooks/use-dashboard-data";

const DashboardPage = () => {
  const { loadDashboardData, retry, error: hookError, retryCount, maxRetries } = useDashboardData();
  
  const {
    loading: globalLoading,
    error: globalError,
    moduleLoading,
    anyModuleLoading,
  } = useModuleState(['admin', 'category', 'user']);

  const categories = useSelector((state) => state.category.categories);
  const dashboardData = useSelector((state) => state.admin.dashboardData);
  const allUsers = useSelector((state) => state.admin.allUsers);

  // ✅ PROBLEM #4 ÇÖZÜMÜ: Optimize edilmiş istatistik hesaplamaları
  const statistics = useMemo(() => {
    // Önce dashboardData'dan dön - bu en hızlı yol
    if (dashboardData) {
      return {
        totalCategories: dashboardData.totalCategories || 0,
        totalProducts: dashboardData.totalProducts || 0,
        totalStock: dashboardData.totalStock || 0,
        totalUsers: dashboardData.totalUsers || allUsers?.length || 0,
        categoryData: dashboardData.categoryData || [],
      };
    }

    // Fallback: Manuel hesaplama (ama sadece gerektiğinde)
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return {
        totalCategories: 0,
        totalProducts: 0,
        totalStock: 0,
        totalUsers: allUsers?.length || 0,
        categoryData: [],
      };
    }

    // Optimizasyon: Tek loop'ta tüm hesaplamaları yap
    const { totalProducts, totalStock, categoryData } = categories.reduce(
      (acc, category) => {
        const products = category.products || [];
        const productCount = products.length;
        
        // Stok hesaplama
        const categoryStock = products.reduce((sum, product) => sum + (product.stock || 0), 0);
        
        acc.totalProducts += productCount;
        acc.totalStock += categoryStock;
        
        // Sadece ürünü olan kategorileri ekle
        if (productCount > 0) {
          acc.categoryData.push({
            name: category.name,
            ürünSayısı: productCount,
            stokMiktarı: categoryStock,
          });
        }
        
        return acc;
      },
      { totalProducts: 0, totalStock: 0, categoryData: [] }
    );

    return {
      totalCategories: categories.length,
      totalProducts,
      totalStock,
      totalUsers: allUsers?.length || 0,
      categoryData,
    };
  }, [dashboardData, categories, allUsers]);

  // Veri yükleme - sadece bir kez çalışır
  useEffect(() => {
    const hasData = dashboardData || (categories && categories.length > 0);
    
    if (!hasData && !anyModuleLoading) {
      loadDashboardData();
    }
  }, [dashboardData, categories, anyModuleLoading, loadDashboardData]);

  // ✅ PROBLEM #5 ÇÖZÜMÜ: Daha detaylı hata gösterimi
  const displayError = hookError || globalError;
  const showRetryInfo = retryCount > 0;

  if (globalLoading || anyModuleLoading) {
    return <SecondaryLoading size="fullPage" />;
  }

  return (
    <div className="space-y-6">
      {/* Hata banner'ı - retry bilgisi ile */}
      {displayError && (
        <DashboardErrorBanner 
          error={displayError}
          onRetry={retry}
          retryCount={showRetryInfo ? retryCount : undefined}
          maxRetries={showRetryInfo ? maxRetries : undefined}
        />
      )}

      {/* İstatistik kartları */}
      <DashboardStatsGrid 
        statistics={statistics} 
        moduleLoading={moduleLoading}
      />

      {/* Grafik */}
      <DashboardChart 
        data={statistics.categoryData}
        loading={moduleLoading.category}
      />

      {/* Kategori tablosu */}
      <DashboardCategoriesTable 
        data={statistics.categoryData}
        loading={moduleLoading.category}
      />
    </div>
  );
};

DashboardPage.props = {
  title: "Dashboard",
  activePage: "dashboard",
  showAddButton: false,
};

export default DashboardPage;