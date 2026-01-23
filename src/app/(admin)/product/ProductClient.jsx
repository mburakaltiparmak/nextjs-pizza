"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import useAuthRoute from "@/lib/hooks/useAuthRole";
import { useAdminLayout } from "@/lib/contexts/AdminLayoutContext";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
    fetchProducts,
    fetchProductsByCategory,
    createProduct,
    updateProduct,
    deleteProduct
} from "@/lib/store/actions/productActions";
import { fetchCategories } from "@/lib/store/actions/categoryActions";
import { fetchStates } from "@/lib/store/constants";

// Custom Hooks
import { useModal } from "@/lib/hooks/admin/useModal";
import { useAdminCRUD } from "@/lib/hooks/admin/useAdminCRUD";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { TIMEOUTS } from "@/lib/utils/adminConstants";

// Components
import { ConfirmationModal } from "@/components/admin/modals";
import { ProductFilters } from "@/components/admin/products/ProductFilters";
import { ProductsTable } from "@/components/admin/products/ProductsTable";
import { ProductFormModal } from "@/components/admin/products/ProductFormModal";
import { Pagination } from "@/components/ui/Pagination";

const ProductClient = () => {
    const router = useRouter();
    const { isAuthorized } = useAuthRoute(["ADMIN", "PERSONAL"], "/");
    const { registerModal } = useAdminLayout();
    const dispatch = useAppDispatch();

    // Modals
    const editModal = useModal();
    const deleteModal = useModal();

    // State
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Debounced search term for client-side filtering
    const debouncedSearchTerm = useDebounce(searchTerm, TIMEOUTS.DEBOUNCE);

    // Redux selectors
    const products = useAppSelector((state) => state.product.products);
    const pagination = useAppSelector((state) => state.product.pagination);
    const categories = useAppSelector((state) => state.category.categories);
    const fetchState = useAppSelector((state) => state.product.fetchState);
    const globalLoading = useAppSelector((state) => state.global.loading);

    // CRUD operations
    const { create, update, remove } = useAdminCRUD({
        createAction: createProduct,
        updateAction: updateProduct,
        deleteAction: deleteProduct,
        refreshAction: () => refreshCurrentView()
    });

    // Initial fetch
    useEffect(() => {
        setIsInitialLoad(true);
        Promise.all([
            dispatch(fetchProducts(0)),
            dispatch(fetchCategories())
        ]).finally(() => {
            setIsInitialLoad(false);
        });
    }, [dispatch]);

    // Category change handler
    const handleCategoryChange = (categoryId) => {
        setFilterCategory(categoryId);
        if (categoryId) {
            dispatch(fetchProductsByCategory(categoryId, 0));
        } else {
            dispatch(fetchProducts(0));
        }
    };

    // Refresh current view
    const refreshCurrentView = () => {
        if (filterCategory) {
            dispatch(fetchProductsByCategory(filterCategory, 0));
        } else {
            dispatch(fetchProducts(0));
        }
    };

    // Register modal with AdminLayoutContext
    useEffect(() => {
        registerModal(editModal.open);
    }, [registerModal, editModal.open]);

    // Client-side filtered products
    const filteredProducts = useMemo(() => {
        if (!debouncedSearchTerm) return products;

        return products.filter(product =>
            product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
    }, [products, debouncedSearchTerm]);

    // Handlers
    const handleFormSubmit = async (data) => {
        const productData = {
            name: data.name,
            rating: data.rating,
            stock: data.stock,
            price: data.price,
            categoryId: data.categoryId,
            image: data.image,
        };

        if (editModal.data) {
            await update(editModal.data.id, productData);
        } else {
            await create(productData);
        }

        editModal.close();
    };

    const handleDelete = async () => {
        if (deleteModal.data) {
            await remove(deleteModal.data.id);
            deleteModal.close();
        }
    };

    // Auth check
    if (!isAuthorized) {
        return null;
    }

    const isLoading = isInitialLoad || fetchState === fetchStates.FETCHING || fetchState === fetchStates.NOT_FETCHED;

    return (
        <div>
            {/* Filters */}
            <ProductFilters
                searchTerm={searchTerm}
                filterCategory={filterCategory}
                categories={categories}
                onSearchChange={setSearchTerm}
                onCategoryChange={handleCategoryChange}
            />

            {/* Products Table */}
            <ProductsTable
                products={filteredProducts}
                categories={categories}
                onEdit={editModal.open}
                onDelete={deleteModal.open}
                onAddNew={() => editModal.open()}
                loading={isLoading}
            />

            {/* Pagination */}
            {products.length > 0 && pagination.totalPages > 1 && (
                <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(page) => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        if (filterCategory) {
                            dispatch(fetchProductsByCategory(filterCategory, page));
                        } else {
                            dispatch(fetchProducts(page));
                        }
                    }}
                />
            )}

            {/* Add/Edit Product Modal */}
            <ProductFormModal
                isOpen={editModal.isOpen}
                onClose={editModal.close}
                onSubmit={handleFormSubmit}
                editingProduct={editModal.data}
                categories={categories}
                isUpdating={globalLoading}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.close}
                onConfirm={handleDelete}
                title="Ürünü Sil"
                message={`${deleteModal.data?.name} ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
            />
        </div>
    );
};

export default ProductClient;
