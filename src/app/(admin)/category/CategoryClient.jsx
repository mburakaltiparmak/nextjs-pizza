"use client";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useAdminModal } from "@/lib/contexts/AdminLayoutContext"; // Updated to use useAdminModal if separate or stick to Layout context
import { useAdminLayout } from "@/lib/contexts/AdminLayoutContext"; // Updated path
import { fetchCategories, deleteCategory } from "@/lib/store/actions/categoryActions";
import { fetchDashboard } from "@/lib/store/actions/adminActions";
import { setSuccess } from "@/lib/store/actions/globalActions";
import { fetchStates } from "@/lib/store/constants";

// Components
import { ConfirmationModal } from "@/components/admin/AdminModals"; // Updated path
import { SearchBar } from "@/components/admin/AdminSearchFilter"; // Updated path
import { CategoryTable } from "@/components/admin/category/CategoryTable";
import { CategoryFormModal } from "@/components/admin/category/CategoryFormModal";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { Pagination } from "@/components/ui/Pagination";

const CategoryClient = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { registerModal } = useAdminLayout();

    const [searchTerm, setSearchTerm] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    // Redux state
    const categories = useAppSelector((state) => state.category.categories);
    const pagination = useAppSelector((state) => state.category.pagination);
    const categoryFetchState = useAppSelector((state) => state.category.fetchState);
    const dashboardData = useAppSelector((state) => state.admin.dashboardData); // +Get Dashboard Data

    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Fetch categories AND dashboard data (for counts) on mount
    useEffect(() => {
        setIsInitialLoad(true);
        Promise.all([
            dispatch(fetchCategories(0)),
            dispatch(fetchDashboard()) // +Fetch Dashboard
        ]).finally(() => setIsInitialLoad(false));
    }, [dispatch]);

    // Register modal with AdminLayoutContext
    const openModal = useCallback((category = null) => {
        setEditingCategory(category);
        setModalOpen(true);
    }, []);

    useEffect(() => {
        registerModal(openModal);
    }, [registerModal, openModal]);

    const closeModal = () => {
        setModalOpen(false);
        setEditingCategory(null);
    };

    const openDeleteModal = (category) => {
        setCategoryToDelete(category);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setCategoryToDelete(null);
        setDeleteModalOpen(false);
    };

    // Mounted ref for memory leak protection
    const mounted = useRef(true);
    useEffect(() => {
        return () => {
            mounted.current = false;
        };
    }, []);

    const handleDelete = async () => {
        if (!categoryToDelete) return;

        try {
            const result = await dispatch(deleteCategory(categoryToDelete.id));

            if (mounted.current && !result.error) {
                dispatch(
                    setSuccess(`"${categoryToDelete.name}" kategorisi başarıyla silindi`)
                );
                // Refresh categories
                dispatch(fetchCategories(pagination.page));
                closeDeleteModal();
            }
        } catch (err) {
            console.error("Kategori silme işlemi sırasında hata:", err);
        }
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

    const filteredCategories = useMemo(() => {
        const source = categoriesWithCounts; // Use enriched data
        if (!source || !Array.isArray(source)) return [];

        return source.filter((category) => {
            if (!category || !category.name || typeof category.name !== "string") {
                return false;
            }
            return category.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [categoriesWithCounts, searchTerm]);

    return (
        <div>
            {/* Arama */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center border border-lightgray">
                <SearchBar
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Kategori ara..."
                />
            </div>

            {/* Tablo */}
            <CategoryTable
                categories={filteredCategories}
                onEdit={openModal}
                onDelete={openDeleteModal}
                onAddNew={() => openModal()}
                loading={isInitialLoad || categoryFetchState === fetchStates.FETCHING || categoryFetchState === fetchStates.NOT_FETCHED}
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

            {/* Kategori Ekleme/Düzenleme Modal */}
            <CategoryFormModal
                open={modalOpen}
                onClose={closeModal}
                editingCategory={editingCategory}
            />

            {/* Silme Onay Modalı */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                title="Kategoriyi Sil"
                message={`${categoryToDelete?.name} kategorisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
                warning={
                    categoryToDelete?.productCount > 0
                        ? `Bu kategori ${categoryToDelete.productCount} ürün içeriyor. Kategoriyi silmek bu ürünleri de etkileyebilir.`
                        : null
                }
            />
        </div>
    );
};

export default CategoryClient;
