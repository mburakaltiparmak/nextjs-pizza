"use client";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import useAuthRoute from "@/lib/hooks/useAuthRole";
import { useAdminLayout } from "@/lib/contexts/AdminLayoutContext";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchProducts, fetchProductsByCategory } from "@/lib/store/actions/productActions";
import { fetchCategories } from "@/lib/store/actions/categoryActions";


// Custom Hooks
import { useProductActions } from "@/lib/hooks/useProductActions";

// Components
import { ConfirmationModal } from "@/components/admin/AdminModals";
import { ProductFilters } from "@/components/admin/products/ProductFilters";
import { ProductsTable } from "@/components/admin/products/ProductsTable";
import { ProductFormModal } from "@/components/admin/products/ProductFormModal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const ProductClient = () => {
    const router = useRouter();
    const { isAuthorized } = useAuthRoute(["ADMIN", "PERSONAL"], "/");
    const { registerModal } = useAdminLayout();

    // State
    // Duplicates removed
    const dispatch = useAppDispatch();

    // Redux Selectors
    const products = useAppSelector((state) => state.product.products);
    const pagination = useAppSelector((state) => state.product.pagination);
    // Categories might still be needed from useProductsManager or Redux. 
    // Homepage uses: const categories = useAppSelector((store) => store.category.categories);
    // Let's assume we need to fetch categories too if not present.
    const categoriesRoot = useAppSelector((state) => state.category.categories);
    // But useProductsManager fetches categories too. Let's start with matching redux.

    // Actually, Admin layout might load initial data? 
    // Let's keep useProductsManager for *categories* if redundant, or better, use Redux for consistency.
    // For now, let's mix: Use Redux for Products (server filter), useProductsManager for Categories (if not in redux).
    // ...Wait, MenuSection uses useHomeData to load initial data.

    // Let's try to stick to Redux for products.

    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("");

    // ... modal states ...
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productToDelete, setProductToDelete] = useState(null);

    // Initial Fetch (similar to MenuSection)
    useEffect(() => {
        // Fetch initial products (page 0)
        dispatch(fetchProducts(0));
        // We also need categories for the filter dropdown
        dispatch(fetchCategories());
    }, [dispatch]);

    // Using useProductsManager ONLY for categories if needed, or better, import fetchCategories.
    // Let's check if fetchCategories is exported from productActions or categoryActions.
    // user said "request and order structure" of homepage.
    // Homepage uses `useHomeData` which likely dispatches `fetchCategories`.

    // Let's rely on `categoriesRoot` from Redux if available.

    const handleCategoryChange = (categoryId) => {
        setFilterCategory(categoryId);
        if (categoryId) {
            dispatch(fetchProductsByCategory(categoryId, 0));
        } else {
            // Reset to all products
            dispatch(fetchProducts(0));
        }
    };

    // Helper to refresh current view (after edit/delete)
    const refreshCurrentView = () => {
        if (filterCategory) {
            dispatch(fetchProductsByCategory(filterCategory, 0));
        } else {
            dispatch(fetchProducts(0));
        }
    };

    const { isUpdating, createProduct, updateProduct, deleteProduct } =
        useProductActions({
            onSuccess: refreshCurrentView, // Refresh redux state instead of local
            // No local updates needed for Redux flow usually, as actions update store?
            // Actually useProductActions might expect local updaters.
            // If we pass null, maybe it works?
            // Let's pass dummy functions or adapt useProductActions.
        });

    // Handlers
    const openModal = useCallback((product = null) => {
        setEditingProduct(product);
        setModalOpen(true);
    }, []);

    // Register modal with AdminLayoutContext
    useEffect(() => {
        registerModal(openModal);
    }, [registerModal, openModal]);

    const closeModal = () => {
        setModalOpen(false);
        setEditingProduct(null);
    };

    const openDeleteModal = (product) => {
        setProductToDelete(product);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setProductToDelete(null);
        setDeleteModalOpen(false);
    };

    // ... handleFormSubmit and handleDeleteProduct remain similar but use new refresh ...

    const handleFormSubmit = async (data, editingProduct) => {
        const productData = {
            name: data.name,
            rating: data.rating,
            stock: data.stock,
            price: data.price,
            categoryId: data.categoryId,
            image: data.image,
        };

        let result;
        if (editingProduct) {
            result = await updateProduct(editingProduct.id, productData);
        } else {
            result = await createProduct(productData);
        }
        return result;
    };

    const handleDeleteProduct = async () => {
        if (!productToDelete) return;

        const result = await deleteProduct(
            productToDelete.id,
            productToDelete.name
        );

        if (result && !result.error) {
            closeDeleteModal();
        }
    };

    // Auth check
    if (!isAuthorized) {
        return null;
    }

    // Loading state removed for skeleton UI
    // if (loading) {
    //     return <LoadingSpinner size="fullPage" />;
    // }

    return (
        <div>
            {/* Filters */}
            {/* Filters */}
            <ProductFilters
                searchTerm={searchTerm}
                filterCategory={filterCategory}
                categories={categoriesRoot}
                onSearchChange={setSearchTerm}
                onCategoryChange={handleCategoryChange}
            />

            {/* Products Table */}
            <ProductsTable
                products={products}
                categories={categoriesRoot}
                onEdit={openModal}
                onDelete={openDeleteModal}
                onAddNew={() => openModal()}
                loading={false} // Redux loading handled globally or component specific?
            />

            {/* Add/Edit Product Modal */}
            <ProductFormModal
                isOpen={modalOpen}
                onClose={closeModal}
                onSubmit={handleFormSubmit}
                editingProduct={editingProduct}
                categories={categoriesRoot}
                isUpdating={isUpdating}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDeleteProduct}
                title="Ürünü Sil"
                message={`${productToDelete?.name} ürününü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
            />
        </div>
    );
};

export default ProductClient;
