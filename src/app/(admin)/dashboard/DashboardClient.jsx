"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useDashboardDataLoader } from "@/lib/hooks/useDashboardDataLoader";
import { fetchDashboard, resetAdminState } from "@/lib/store/actions/adminActions";
import {
    DashboardStatsGrid,
    DashboardChart,
    DashboardCategoriesTable,
    DashboardErrorBanner,
} from "@/components/admin/dashboard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAppSelector } from "@/lib/store/hooks";
import { fetchStates } from "@/lib/store/constants";

const DashboardClient = () => {
    // Auto-fetches data on mount
    useDashboardDataLoader();
    const dispatch = useDispatch();

    // Force refresh on mount to show skeletons
    useEffect(() => {
        dispatch(fetchDashboard(true));
    }, [dispatch]);

    const dashboardData = useAppSelector((state) => state.admin.dashboard.data);
    const adminFetchState = useAppSelector((state) => state.admin.dashboard.fetchState);

    // Treat NOT_FETCHED as loading to show skeleton immediately on mount
    const loading = adminFetchState === fetchStates.FETCHING || adminFetchState === fetchStates.NOT_FETCHED;
    const error = useAppSelector((state) => state.global.error);

    const statistics = dashboardData; // Pass null if no data, Grid will handle it

    const handleRetry = () => {
        dispatch(fetchDashboard());
    };



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
                loading={loading}
            />

            {/* Chart */}
            <DashboardChart data={statistics?.categoryData} loading={loading} />

            {/* Categories Table */}
            <DashboardCategoriesTable
                data={statistics?.categoryData}
                loading={loading}
            />
        </div>
    );
};

export default DashboardClient;
