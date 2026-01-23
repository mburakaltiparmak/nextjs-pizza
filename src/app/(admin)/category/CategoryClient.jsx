"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminLayout } from "@/lib/contexts/AdminLayoutContext";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
    fetchCategories,
    deleteCategory,
    updateCategory,
    createCategory
} from "@/lib/store/actions/categoryActions";
import { fetchDashboard } from "@/lib/store/actions/adminActions";
import { fetchStates } from "@/lib/store/constants";

// Custom Hooks
import { useModal } from "@/lib/hooks/admin/useModal";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { TIMEOUTS } from "@/lib/utils/adminConstants";

// Components
import { ConfirmationModal } from "@/components/admin/modals";
import { SearchBar } from "@/components/admin/search";
import { CategoryTable } from "@/components/admin/category/CategoryTable";
import { CategoryFormModal } from "@/components/admin/category/CategoryFormModal";
import { Pagination } from "@/components/ui/Pagination";

const CategoryClient = () => {
    const router = useRouter();
    const { registerModal } = useAdminLayout();
    const dispatch = useAppDispatch();

    // Modals
    const editModal = useModal();
    const deleteModal = useModal();

    // State
    const [searchTerm, setSearchTerm] = useState("");
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Debounced search term for client-side filtering
    const debouncedSearchTerm = useDebounce(searchTerm, TIMEOUTS.DEBOUNCE);

    // Redux selectors
    const categories = useAppSelector((state) => state.category.categories);
    const pagination = useAppSelector((state) => state.category.pagination);
    const categoryFetchState = useAppSelector((state) => state.category.fetchState);
    const dashboardData = useAppSelector((state) => state.admin.dashboard.data);
    const globalLoading = useAppSelector((state) => state.global.loading);

    // Fetch categories AND dashboard data (for counts) on mount
    useEffect(() => {
        setIsInitialLoad(true);
        Promise.all([
            dispatch(fetchCategories(0)),
            dispatch(fetchDashboard())
        ]).finally(() => setIsInitialLoad(false));
    }, [dispatch]);

    // Register modal with AdminLayoutContext
    useEffect(() => {
        registerModal(editModal.open);
    }, [registerModal, editModal.open]);

    // Handlers
    const handleDelete = async () => {
        if (!deleteModal.data) return;

        await dispatch(deleteCategory(deleteModal.data.id));
        dispatch(fetchCategories(pagination.page));
        deleteModal.close();
    };

    // Merge categories with product counts from dashboardData
    const categoriesWithCounts = useMemo(() => {
        if (!categories || !Array.isArray(categories)) return [];

        // If we have dashboard data, map counts
        if (dashboardData && dashboardData.categories) {
            return categories.map(cat => {
                const dashboardCat = dashboardData.categories.find(d => d.id === cat.id);
                return {
                    ...cat,
                    productCount: dashboardCat ? (dashboardCat.productCount || 0) : (cat.productCount || 0)
                };
            });
        }

        return categories;
    }, [categories, dashboardData]);

    // Filtered categories with debounced search
    const filteredCategories = useMemo(() => {
        const source = categoriesWithCounts;
        if (!source || !Array.isArray(source)) return [];

        return source.filter((category) => {
            if (!category || !category.name || typeof category.name !== "string") {
                return false;
            }
            return category.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        });
    }, [categoriesWithCounts, debouncedSearchTerm]);

    const isLoading = isInitialLoad || categoryFetchState === fetchStates.FETCHING || categoryFetchState === fetchStates.NOT_FETCHED;

    return (
        <div>
            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center border border-lightgray">
                <SearchBar
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Kategori ara..."
                />
            </div>

            {/* Table */}
            <CategoryTable
                categories={filteredCategories}
                onEdit={editModal.open}
                onDelete={deleteModal.open}
                onAddNew={() => editModal.open()}
                loading={isLoading}
            />

            {/* Pagination */}
            {categories.length > 0 && pagination.totalPages > 1 && (
                <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(page) => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        dispatch(fetchCategories(page));
                    }}
                />
            )}

            {/* Category Add/Edit Modal */}
            <CategoryFormModal
                open={editModal.isOpen}
                onClose={editModal.close}
                editingCategory={editModal.data}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.close}
                onConfirm={handleDelete}
                title="Kategoriyi Sil"
                message={`${deleteModal.data?.name} kategorisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
                warning={
                    deleteModal.data?.productCount > 0
                        ? `Bu kategori ${deleteModal.data.productCount} ürün içeriyor. Kategoriyi silmek bu ürünleri de etkileyebilir.`
                        : null
                }
            />
        </div>
    );
};

export default CategoryClient;
