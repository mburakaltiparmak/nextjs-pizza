import { useState, useCallback, useRef, useEffect } from "react";
import { instance } from "@/lib/hooks";
import { useToast } from "@/lib/hooks/useToast";

/**
 * Product işlemleri için hook
 * - Create product
 * - Update product
 * - Delete product
 */
export const useProductActions = ({
    onSuccess,
    updateProductLocally,
    addProductLocally,
    removeProductLocally,
}) => {
    const { toast } = useToast();

    // State
    const [isUpdating, setIsUpdating] = useState(false);

    // Refs
    const mountedRef = useRef(true);
    const updateInProgressRef = useRef(false);

    /**
     * Yeni ürün oluştur
     */
    const createProduct = useCallback(
        async (productData) => {
            if (updateInProgressRef.current) {
                console.log("⚠️ Update already in progress, skipping");
                return { error: true };
            }

            updateInProgressRef.current = true;
            setIsUpdating(true);

            try {
                console.log("➕ Creating product:", productData);

                // FormData oluştur (image upload için)
                const formData = new FormData();
                formData.append("name", productData.name);
                formData.append("price", productData.price);
                formData.append("stock", productData.stock);
                formData.append("rating", productData.rating);
                formData.append("categoryId", productData.categoryId);

                if (productData.image) {
                    formData.append("image", productData.image);
                }

                const response = await instance.post("/product", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                if (!mountedRef.current) return { error: true };

                console.log("✅ Product created successfully");

                // Local state'e ekle
                if (addProductLocally) {
                    addProductLocally(response.data);
                }

                toast({
                    title: "Başarılı",
                    description: "Ürün başarıyla eklendi",
                });

                if (onSuccess) {
                    onSuccess();
                }

                return { error: false };
            } catch (error) {
                if (!mountedRef.current) return { error: true };

                console.error("❌ Create product error:", error);
                toast({
                    title: "Hata",
                    description: "Ürün eklenemedi",
                    variant: "destructive",
                });

                return { error: true };
            } finally {
                if (mountedRef.current) {
                    setIsUpdating(false);
                }
                updateInProgressRef.current = false;
            }
        },
        [addProductLocally, toast, onSuccess]
    );

    /**
     * Ürün güncelle
     */
    const updateProduct = useCallback(
        async (productId, productData) => {
            if (updateInProgressRef.current) {
                console.log("⚠️ Update already in progress, skipping");
                return { error: true };
            }

            updateInProgressRef.current = true;
            setIsUpdating(true);

            try {
                console.log(`🔄 Updating product ${productId}:`, productData);

                // FormData oluştur
                const formData = new FormData();
                formData.append("name", productData.name);
                formData.append("price", productData.price);
                formData.append("stock", productData.stock);
                formData.append("rating", productData.rating);
                formData.append("categoryId", productData.categoryId);

                if (productData.image) {
                    formData.append("image", productData.image);
                }

                const response = await instance.put(`/product/${productId}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                if (!mountedRef.current) return { error: true };

                console.log("✅ Product updated successfully");

                // Local state'i güncelle
                if (updateProductLocally) {
                    updateProductLocally(productId, response.data);
                }

                toast({
                    title: "Başarılı",
                    description: "Ürün başarıyla güncellendi",
                });

                if (onSuccess) {
                    onSuccess();
                }

                return { error: false };
            } catch (error) {
                if (!mountedRef.current) return { error: true };

                console.error("❌ Update product error:", error);
                toast({
                    title: "Hata",
                    description: "Ürün güncellenemedi",
                    variant: "destructive",
                });

                return { error: true };
            } finally {
                if (mountedRef.current) {
                    setIsUpdating(false);
                }
                updateInProgressRef.current = false;
            }
        },
        [updateProductLocally, toast, onSuccess]
    );

    /**
     * Ürün sil
     */
    const deleteProduct = useCallback(
        async (productId, productName) => {
            if (updateInProgressRef.current) {
                console.log("⚠️ Update already in progress, skipping");
                return { error: true };
            }

            updateInProgressRef.current = true;
            setIsUpdating(true);

            try {
                console.log(`🗑️ Deleting product ${productId}`);

                await instance.delete(`/product/${productId}`);

                if (!mountedRef.current) return { error: true };

                console.log("✅ Product deleted successfully");

                // Local state'ten kaldır
                if (removeProductLocally) {
                    removeProductLocally(productId);
                }

                toast({
                    title: "Başarılı",
                    description: `${productName} silindi`,
                });

                if (onSuccess) {
                    onSuccess();
                }

                return { error: false };
            } catch (error) {
                if (!mountedRef.current) return { error: true };

                console.error("❌ Delete product error:", error);
                toast({
                    title: "Hata",
                    description: "Ürün silinemedi",
                    variant: "destructive",
                });

                return { error: true };
            } finally {
                if (mountedRef.current) {
                    setIsUpdating(false);
                }
                updateInProgressRef.current = false;
            }
        },
        [removeProductLocally, toast, onSuccess]
    );

    // Cleanup
    useEffect(() => {
        return () => {
            mountedRef.current = false;
            updateInProgressRef.current = false;
        };
    }, []);

    return {
        isUpdating,
        createProduct,
        updateProduct,
        deleteProduct,
    };
};
