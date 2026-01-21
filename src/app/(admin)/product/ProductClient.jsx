"use client";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import useAuthRoute from "@/lib/hooks/useAuthRole";
import { useAdminLayout } from "@/lib/contexts/AdminLayoutContext";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchProducts, fetchProductsByCategory, resetProductState } from "@/lib/store/actions/productActions";
import { fetchCategories } from "@/lib/store/actions/categoryActions";
import { fetchStates } from "@/lib/store/constants";


// Custom Hooks
import { useProductActions } from "@/lib/hooks/useProductActions";

// Components
import { ConfirmationModal } from "@/components/admin/AdminModals";
import { ProductFilters } from "@/components/admin/products/ProductFilters";
import { ProductsTable } from "@/components/admin/products/ProductsTable";
import { ProductFormModal } from "@/components/admin/products/ProductFormModal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Pagination } from "@/components/ui/Pagination";

const ProductClient = () => {
    const router = useRouter();
    const { isAuthorized } = useAuthRoute(["ADMIN", "PERSONAL"], "/");
    const { registerModal } = useAdminLayout();
    const dispatch = useAppDispatch();

    const products = useAppSelector((state) => state.product.products);
    const pagination = useAppSelector((state) => state.product.pagination);
    const categoriesRoot = useAppSelector((state) => state.category.categories);
    const fetchState = useAppSelector((state) => state.product.fetchState);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productToDelete, setProductToDelete] = useState(null);

    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        // Ensure loading state is active until initial fetch completes
        setIsInitialLoad(true);
        Promise.all([
            dispatch(fetchProducts(0)),
            dispatch(fetchCategories())
        ]).finally(() => {
            setIsInitialLoad(false);
        });
    }, [dispatch]);



    const handleCategoryChange = (categoryId) => {
        setFilterCategory(categoryId);
        if (categoryId) {
            dispatch(fetchProductsByCategory(categoryId, 0));
        } else {
            dispatch(fetchProducts(0));
        }
    };

    const refreshCurrentView = () => {
        if (filterCategory) {
            dispatch(fetchProductsByCategory(filterCategory, 0));
        } else {
            dispatch(fetchProducts(0));
        }
    };

    const { isUpdating, createProduct, updateProduct, deleteProduct } =
        useProductActions({
            onSuccess: refreshCurrentView,
        });

    const openModal = useCallback((product = null) => {
        setEditingProduct(product);
        setModalOpen(true);
    }, []);

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

    return (
        <div>
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
                loading={isInitialLoad || fetchState === fetchStates.FETCHING || fetchState === fetchStates.NOT_FETCHED}
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
