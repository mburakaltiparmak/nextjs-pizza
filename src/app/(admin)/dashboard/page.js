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

  // Debug: Redux state'i logla
  useEffect(() => {
    console.log("🔍 Dashboard Redux State:", {
      dashboardData,
      categories: categories?.length,
      allUsers: allUsers?.length,
      moduleLoading,
      anyModuleLoading
    });
  }, [dashboardData, categories, allUsers, moduleLoading, anyModuleLoading]);

  // ✅ İstatistik hesaplamaları - dashboardData'dan direkt al
  const statistics = useMemo(() => {
    console.log("📊 Computing statistics...", { 
      hasDashboardData: !!dashboardData,
      dashboardDataKeys: dashboardData ? Object.keys(dashboardData) : []
    });

    // Önce dashboardData'dan dön - bu en güncel ve doğru veri
    if (dashboardData) {
      const stats = {
        totalCategories: dashboardData.totalCategories || 0,
        totalProducts: dashboardData.totalProducts || 0,
        totalStock: dashboardData.totalStock || 0,
        totalUsers: dashboardData.totalUsers || allUsers?.length || 0,
        categoryData: dashboardData.categoryData || [],
      };
      
      console.log("✅ Statistics from dashboardData:", stats);
      return stats;
    }

    // Fallback: Manuel hesaplama (sadece dashboardData yoksa)
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      console.log("⚠️ No categories available for fallback calculation");
      return {
        totalCategories: 0,
        totalProducts: 0,
        totalStock: 0,
        totalUsers: allUsers?.length || 0,
        categoryData: [],
      };
    }

    console.log("⚠️ Using fallback calculation from categories");

    // Optimizasyon: Tek loop'ta tüm hesaplamaları yap
    const { totalProducts, totalStock, categoryData } = categories.reduce(
      (acc, category) => {
        const products = category.products || [];
        const productCount = products.length;
        
        // Stok hesaplama
        const categoryStock = products.reduce((sum, product) => sum + (product.stock || 0), 0);
        
        acc.totalProducts += productCount;
        acc.totalStock += categoryStock;
        
        // Sadece ürünü olan kategorileri ekle ve Custom Pizza hariç
        if (productCount > 0 && category.name !== "Custom Pizza") {
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

    const fallbackStats = {
      totalCategories: categories.length,
      totalProducts,
      totalStock,
      totalUsers: allUsers?.length || 0,
      categoryData,
    };

    console.log("✅ Fallback statistics:", fallbackStats);
    return fallbackStats;
  }, [dashboardData, categories, allUsers]);

  // Veri yükleme - sadece bir kez çalışır
  useEffect(() => {
    const hasData = dashboardData || (categories && categories.length > 0);
    
    console.log("🔄 Data loading check:", { 
      hasData, 
      anyModuleLoading,
      hasDashboardData: !!dashboardData,
      hasCategories: !!(categories && categories.length > 0)
    });
    
    if (!hasData && !anyModuleLoading) {
      console.log("⏳ Loading dashboard data...");
      loadDashboardData();
    } else if (hasData) {
      console.log("✅ Dashboard data already available, skipping load");
    }
  }, [dashboardData, categories, anyModuleLoading, loadDashboardData]);

  // Hata gösterimi
  const displayError = hookError || globalError;
  const showRetryInfo = retryCount > 0;

  // Loading state kontrolü
  if (globalLoading || anyModuleLoading) {
    console.log("⏳ Dashboard is loading...");
    return <SecondaryLoading size="fullPage" />;
  }

  console.log("🎨 Rendering dashboard with statistics:", statistics);

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