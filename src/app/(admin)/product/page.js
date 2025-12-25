"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthRoute from "@/hooks/use-auth-role";
import { useAdminLayout } from "@/contexts/AdminLayoutContext";

// Custom Hooks
import { useProductsManager, useProductActions } from "@/hooks";

// Components
import { ConfirmationModal } from "@/components/admin/modal";
import { ProductFilters } from "@/components/admin/products/ProductFilters";
import { ProductsTable } from "@/components/admin/products/ProductsTable";
import { ProductFormModal } from "@/components/admin/products/ProductFormModal";
import SecondaryLoading from "@/components/secondaryLoading";

const ProductPage = () => {
  const router = useRouter();
  const { isAuthorized } = useAuthRoute(["ADMIN", "PERSONAL"], "/");
  const { registerModal } = useAdminLayout();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  // Custom Hooks
  const {
    products,
    categories,
    loading,
    isRefreshing,
    refreshProducts,
    updateProductLocally,
    addProductLocally,
    removeProductLocally,
  } = useProductsManager();

  const { isUpdating, createProduct, updateProduct, deleteProduct } =
    useProductActions({
      onSuccess: refreshProducts,
      updateProductLocally,
      addProductLocally,
      removeProductLocally,
    });

  // Filtered products - memoized
  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) {
      return [];
    }

    return products.filter((product) => {
      if (!product || !product.name || typeof product.name !== "string") {
        return false;
      }

      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      let matchesCategory = true;
      if (filterCategory !== "") {
        matchesCategory =
          product.categoryId &&
          product.categoryId.toString() === filterCategory;
      }

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, filterCategory]);

  // Handlers
  const openModal = (product = null) => {
    console.log("open modal clicked");
    setEditingProduct(product);
    setModalOpen(true);
  };

  // Register modal with AdminLayoutContext
  useEffect(() => {
    registerModal(openModal);
  }, [registerModal]);

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

  // Loading state
  if (loading) {
    return <SecondaryLoading size="fullPage" />;
  }

  return (
    <div>
      {/* Filters */}
      <ProductFilters
        searchTerm={searchTerm}
        filterCategory={filterCategory}
        categories={categories}
        onSearchChange={setSearchTerm}
        onCategoryChange={setFilterCategory}
      />

      {/* Products Table */}
      <ProductsTable
        products={filteredProducts}
        categories={categories}
        onEdit={openModal}
        onDelete={openDeleteModal}
        onAddNew={() => openModal()}
        loading={loading}
      />

      {/* Add/Edit Product Modal */}
      <ProductFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        editingProduct={editingProduct}
        categories={categories}
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

export default ProductPage;
