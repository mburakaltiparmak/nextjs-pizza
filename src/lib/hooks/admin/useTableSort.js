/**
 * useTableSort Hook
 * Generic table sorting hook for admin tables
 * 
 * @param {Array} data - Data array to sort
 * @param {string} defaultField - Default sort field
 * @param {string} defaultDirection - Default sort direction ('asc' or 'desc')
 * @param {Object} sortFunctions - Custom sort functions for specific fields
 * @returns {Object} Sorted data and sort controls
 */

import { useState, useMemo, useCallback } from "react";
import { SORT_DIRECTION } from "@/lib/utils/adminConstants";

export const useTableSort = (
    data,
    defaultField = "id",
    defaultDirection = SORT_DIRECTION.DESC,
    sortFunctions = {}
) => {
    const [sortField, setSortField] = useState(defaultField);
    const [sortDirection, setSortDirection] = useState(defaultDirection);

    /**
     * Handle sort field change
     * If clicking same field, toggle direction
     * If clicking new field, set to default direction (DESC)
     */
    const handleSort = useCallback((field) => {
        if (sortField === field) {
            // Toggle direction
            setSortDirection(prev =>
                prev === SORT_DIRECTION.ASC ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC
            );
        } else {
            // New field, default to descending
            setSortField(field);
            setSortDirection(SORT_DIRECTION.DESC);
        }
    }, [sortField]);

    /**
     * Reset sort to defaults
     */
    const resetSort = useCallback(() => {
        setSortField(defaultField);
        setSortDirection(defaultDirection);
    }, [defaultField, defaultDirection]);

    /**
     * Set sort programmatically
     */
    const setSort = useCallback((field, direction) => {
        setSortField(field);
        setSortDirection(direction);
    }, []);

    /**
     * Sorted data
     */
    const sortedData = useMemo(() => {
        if (!data || data.length === 0) return [];

        const sorted = [...data].sort((a, b) => {
            // Use custom sort function if provided
            if (sortFunctions[sortField]) {
                return sortFunctions[sortField](a, b, sortDirection);
            }

            // Get values to compare
            let aValue = a[sortField];
            let bValue = b[sortField];

            // Handle nested properties (e.g., "user.name")
            if (sortField.includes(".")) {
                const keys = sortField.split(".");
                aValue = keys.reduce((obj, key) => obj?.[key], a);
                bValue = keys.reduce((obj, key) => obj?.[key], b);
            }

            // Handle null/undefined
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1;
            if (bValue == null) return -1;

            // Handle dates
            if (aValue instanceof Date && bValue instanceof Date) {
                const diff = aValue.getTime() - bValue.getTime();
                return sortDirection === SORT_DIRECTION.ASC ? diff : -diff;
            }

            // Try to parse as date if string looks like a date
            if (typeof aValue === "string" && typeof bValue === "string") {
                const aDate = new Date(aValue);
                const bDate = new Date(bValue);
                if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
                    const diff = aDate.getTime() - bDate.getTime();
                    return sortDirection === SORT_DIRECTION.ASC ? diff : -diff;
                }
            }

            // String comparison (case-insensitive)
            if (typeof aValue === "string" && typeof bValue === "string") {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            // Numeric or string comparison
            if (aValue < bValue) return sortDirection === SORT_DIRECTION.ASC ? -1 : 1;
            if (aValue > bValue) return sortDirection === SORT_DIRECTION.ASC ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [data, sortField, sortDirection, sortFunctions]);

    return {
        sortedData,
        sortField,
        sortDirection,
        handleSort,
        resetSort,
        setSort
    };
};

/**
 * Usage Example:
 * 
 * const { sortedData, sortField, sortDirection, handleSort } = useTableSort(
 *   orders,
 *   "orderDate",
 *   "desc",
 *   {
 *     // Custom sort function for customer field
 *     customer: (a, b, direction) => {
 *       const aName = (a.userName || a.deliveryAddress?.recipientName || "").toLowerCase();
 *       const bName = (b.userName || b.deliveryAddress?.recipientName || "").toLowerCase();
 *       const comparison = aName.localeCompare(bName);
 *       return direction === "asc" ? comparison : -comparison;
 *     }
 *   }
 * );
 * 
 * // In table header
 * <th onClick={() => handleSort("orderDate")}>
 *   Date {sortField === "orderDate" && (sortDirection === "asc" ? "↑" : "↓")}
 * </th>
 */
