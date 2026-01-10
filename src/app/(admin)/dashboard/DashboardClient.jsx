"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useDashboardDataLoader } from "@/lib/hooks/useDashboardDataLoader";
import { fetchDashboard } from "@/lib/store/actions/adminActions";
import {
    DashboardStatsGrid,
    DashboardChart,
    DashboardCategoriesTable,
    DashboardErrorBanner,
} from "@/components/dashboard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAppSelector } from "@/lib/store/hooks";

const DashboardClient = () => {
    // Auto-fetches data on mount
    useDashboardDataLoader();
    const dispatch = useDispatch();

    const dashboardData = useAppSelector((state) => state.admin.dashboardData);
    const loading = useAppSelector((state) => state.global.loading);
    const error = useAppSelector((state) => state.global.error);

    const statistics = dashboardData || {
        totalCategories: 0,
        totalProducts: 0,
        totalStock: 0,
        totalUsers: 0,
        categoryData: [],
    };

    const handleRetry = () => {
        dispatch(fetchDashboard());
    };

    if (loading && !dashboardData) {
        return <LoadingSpinner size="fullPage" />;
    }

    return (
        <div className="space-y-6">
            {/* Error Banner */}
            {error && (
                <DashboardErrorBanner
                    error={error}
                    onRetry={handleRetry}
                // retryCount and maxRetries are handled internally by the hook/action now, 
                // but we provide manual retry here.
                />
            )}

            {/* Stats Grid */}
            <DashboardStatsGrid
                statistics={statistics}
                moduleLoading={{ admin: loading }}
            />

            {/* Chart */}
            <DashboardChart data={statistics.categoryData} loading={loading} />

            {/* Categories Table */}
            <DashboardCategoriesTable
                data={statistics.categoryData}
                loading={loading}
            />
        </div>
    );
};

export default DashboardClient;
