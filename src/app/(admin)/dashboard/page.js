"use client";

import { useEffect } from "react";
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
  } = useModuleState(['admin']);

  // ✅ Tek kaynak: dashboardData (DTO'dan geliyor)
  const dashboardData = useSelector((state) => state.admin.dashboardData);

  // ✅ Debug: Redux state'i logla
  useEffect(() => {
    console.log("🔍 Dashboard State:", {
      hasDashboardData: !!dashboardData,
      totalCategories: dashboardData?.totalCategories,
      totalProducts: dashboardData?.totalProducts,
      categoryDataLength: dashboardData?.categoryData?.length,
      anyModuleLoading
    });
  }, [dashboardData, anyModuleLoading]);

  // ✅ Statistics artık direkt dashboardData'dan geliyor (hesaplama yok)
  const statistics = dashboardData || {
    totalCategories: 0,
    totalProducts: 0,
    totalStock: 0,
    totalUsers: 0,
    categoryData: [],
  };

  // ✅ Veri yükleme - sadece dashboardData yoksa
  useEffect(() => {
    if (!dashboardData && !anyModuleLoading) {
      console.log("⏳ Loading dashboard data...");
      loadDashboardData();
    } else if (dashboardData) {
      console.log("✅ Dashboard data available:", {
        categories: statistics.totalCategories,
        products: statistics.totalProducts,
        stock: statistics.totalStock
      });
    }
  }, [dashboardData, anyModuleLoading, loadDashboardData, statistics]);

  // Hata gösterimi
  const displayError = hookError || globalError;
  const showRetryInfo = retryCount > 0;

  // Loading state
  if (globalLoading || anyModuleLoading) {
    return <SecondaryLoading size="fullPage" />;
  }

  return (
    <div className="space-y-6">
      {/* Hata banner'ı */}
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
        loading={moduleLoading.admin}
      />

      {/* Kategori tablosu */}
      <DashboardCategoriesTable 
        data={statistics.categoryData}
        loading={moduleLoading.admin}
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