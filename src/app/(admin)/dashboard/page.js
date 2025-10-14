"use client";

import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useModuleState } from "@/lib/hooks/useModuleLoading";
import SecondaryLoading from "@/components/secondaryLoading";
import {
  DashboardStatsGrid,
  DashboardChart,
  DashboardCategoriesTable,
  DashboardErrorBanner,
} from "@/components/dashboard";
import { useDashboardData } from "@/lib/hooks/useDashboardData";

const DashboardPage = () => {
  const { loadDashboardData, retry } = useDashboardData();
  
  const {
    loading: globalLoading,
    error: globalError,
    moduleLoading,
    anyModuleLoading,
  } = useModuleState(['admin', 'category', 'user']);

  const categories = useSelector((state) => state.category.categories);
  const dashboardData = useSelector((state) => state.admin.dashboardData);
  const allUsers = useSelector((state) => state.admin.allUsers);

  const statistics = useMemo(() => {
    if (dashboardData) {
      return {
        totalCategories: dashboardData.totalCategories || 0,
        totalProducts: dashboardData.totalProducts || 0,
        totalStock: dashboardData.totalStock || 0,
        totalUsers: dashboardData.totalUsers || allUsers?.length || 0,
        categoryData: dashboardData.categoryData || [],
      };
    }

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

  useEffect(() => {
    const hasData = dashboardData || (categories && categories.length > 0);
    
    if (!hasData && !anyModuleLoading) {
      loadDashboardData();
    }
  }, [dashboardData, categories, anyModuleLoading, loadDashboardData]);

  if (globalLoading || anyModuleLoading) {
    return <SecondaryLoading size="fullPage" />;
  }

  return (
    <div>
      <DashboardErrorBanner error={globalError} onRetry={retry} />
      <DashboardStatsGrid statistics={statistics} moduleLoading={moduleLoading} />
      <DashboardChart data={statistics.categoryData} />
      <DashboardCategoriesTable data={statistics.categoryData} />
    </div>
  );
};

DashboardPage.props = {
  title: "Dashboard",
  activePage: "dashboard",
  showAddButton: false,
};

export default DashboardPage;