/**
 * usePaginatedData Hook
 * Generic hook for fetching and managing paginated data from Redux
 * 
 * @param {Object} config - Configuration object
 * @param {Function} config.fetchAction - Redux action to fetch data
 * @param {Function} config.dataSelector - Redux selector for data
 * @param {Function} config.paginationSelector - Redux selector for pagination
 * @param {Function} config.fetchStateSelector - Redux selector for fetch state
 * @param {number} config.initialPage - Initial page number
 * @param {number} config.pageSize - Page size
 * @returns {Object} Paginated data state and controls
 */

import { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchStates } from "@/lib/store/constants";
import { PAGINATION } from "@/lib/utils/adminConstants";

export const usePaginatedData = ({
    fetchAction,
    dataSelector,
    paginationSelector,
    fetchStateSelector,
    initialPage = PAGINATION.DEFAULT_PAGE,
    pageSize = PAGINATION.DEFAULT_SIZE,
    autoFetch = true
}) => {
    const dispatch = useAppDispatch();

    // Redux selectors
    const data = useAppSelector(dataSelector);
    const pagination = useAppSelector(paginationSelector);
    const fetchState = useAppSelector(fetchStateSelector);

    // Local state
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    /**
     * Fetch specific page
     */
    const fetchPage = useCallback((page = initialPage, size = pageSize) => {
        return dispatch(fetchAction(page, size));
    }, [dispatch, fetchAction, initialPage, pageSize]);

    /**
     * Initial fetch on mount
     */
    useEffect(() => {
        if (!autoFetch) return;

        setIsInitialLoad(true);
        fetchPage(initialPage, pageSize).finally(() => {
            setIsInitialLoad(false);
        });
    }, [autoFetch, fetchPage, initialPage, pageSize]);

    /**
     * Handle page change with scroll to top
     */
    const handlePageChange = useCallback((page) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fetchPage(page, pageSize);
    }, [fetchPage, pageSize]);

    /**
     * Refresh current page
     */
    const refresh = useCallback(() => {
        const currentPage = pagination?.page ?? initialPage;
        fetchPage(currentPage, pageSize);
    }, [fetchPage, pagination, initialPage, pageSize]);

    /**
     * Go to first page
     */
    const goToFirstPage = useCallback(() => {
        handlePageChange(0);
    }, [handlePageChange]);

    /**
     * Go to last page
     */
    const goToLastPage = useCallback(() => {
        if (pagination?.totalPages) {
            handlePageChange(pagination.totalPages - 1);
        }
    }, [handlePageChange, pagination]);

    /**
     * Go to next page
     */
    const goToNextPage = useCallback(() => {
        if (pagination && pagination.page < pagination.totalPages - 1) {
            handlePageChange(pagination.page + 1);
        }
    }, [handlePageChange, pagination]);

    /**
     * Go to previous page
     */
    const goToPreviousPage = useCallback(() => {
        if (pagination && pagination.page > 0) {
            handlePageChange(pagination.page - 1);
        }
    }, [handlePageChange, pagination]);

    // Loading states
    const isLoading = isInitialLoad ||
        fetchState === fetchStates.FETCHING ||
        fetchState === fetchStates.NOT_FETCHED;

    const isFetching = fetchState === fetchStates.FETCHING;
    const hasFailed = fetchState === fetchStates.FAILED;
    const hasData = fetchState === fetchStates.FETCHED && data && data.length > 0;

    return {
        // Data
        data,
        pagination,

        // Loading states
        isLoading,
        isInitialLoad,
        isFetching,
        hasFailed,
        hasData,

        // Actions
        fetchPage,
        handlePageChange,
        refresh,
        goToFirstPage,
        goToLastPage,
        goToNextPage,
        goToPreviousPage
    };
};

/**
 * Usage Example:
 * 
 * const {
 *   data: users,
 *   pagination,
 *   isLoading,
 *   handlePageChange,
 *   refresh
 * } = usePaginatedData({
 *   fetchAction: fetchAllUsers,
 *   dataSelector: state => state.admin.users.all,
 *   paginationSelector: state => state.admin.users.pagination,
 *   fetchStateSelector: state => state.admin.users.fetchState
 * });
 * 
 * // In component
 * {isLoading ? <Skeleton /> : <UsersTable users={users} />}
 * 
 * <Pagination
 *   currentPage={pagination.page}
 *   totalPages={pagination.totalPages}
 *   onPageChange={handlePageChange}
 * />
 */
