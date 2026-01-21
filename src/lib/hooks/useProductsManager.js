import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { instance } from "@/lib/hooks";
import { useToast } from "@/lib/hooks/useToast";

/**
 * Products ve Categories için veri yönetimi hook'u
 */
export const useProductsManager = () => {
    const { toast } = useToast();

    // State
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Refs
    const mountedRef = useRef(true);
    const abortControllerRef = useRef(null);
    const initialFetchDoneRef = useRef(false);

    /**
     * API'den products ve categories getir
     */
    const fetchData = useCallback(async () => {
        // Önceki isteği iptal et
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        setLoading(true);

        try {
            console.log("🔄 Fetching products and categories...");

            // Paginated endpoint'leri kullan - büyük size ile tüm datayı çek
            const [productsRes, categoriesRes] = await Promise.all([
                instance.get("/product/paged?size=10", { signal: abortController.signal }),
                instance.get("/category/paged?size=10", { signal: abortController.signal }),
            ]);

            if (!mountedRef.current) return;

            // Paginated response'dan content'i çıkar
            const productsData = productsRes.data.content || [];
            const categoriesData = categoriesRes.data.content || [];

            setProducts(productsData);
            setCategories(categoriesData);
            initialFetchDoneRef.current = true;

            console.log(
                `✅ Data loaded: ${productsData.length} products, ${categoriesData.length} categories`
            );
        } catch (error) {
            if (!mountedRef.current) return;

            if (error.name === "AbortError" || error.name === "CanceledError") {
                console.log("⏹️ Fetch aborted");
                return;
            }

            console.error("❌ Fetch error:", error);
            toast({
                title: "Hata",
                description: "Veriler yüklenirken bir sorun oluştu",
                variant: "destructive",
            });
        } finally {
            if (mountedRef.current) {
                setLoading(false);
                setIsRefreshing(false);
            }
            abortControllerRef.current = null;
        }
    }, [toast]);

    /**
     * Manuel yenileme
     */
    const refreshProducts = useCallback(() => {
        console.log("🔄 Manual refresh triggered");
        setIsRefreshing(true);
        fetchData();
    }, [fetchData]);

    /**
     * Local state'te product güncelle
     */
    const updateProductLocally = useCallback((productId, updates) => {
        setProducts((prevProducts) =>
            prevProducts.map((product) =>
                product.id === productId ? { ...product, ...updates } : product
            )
        );
    }, []);

    /**
     * Local state'e product ekle
     */
    const addProductLocally = useCallback((product) => {
        setProducts((prevProducts) => [...prevProducts, product]);
    }, []);

    /**
     * Local state'ten product kaldır
     */
    const removeProductLocally = useCallback((productId) => {
        setProducts((prevProducts) =>
            prevProducts.filter((product) => product.id !== productId)
        );
    }, []);

    // Initial fetch - sadece bir kere
    useEffect(() => {
        fetchData();

        // Cleanup
        return () => {
            console.log("🧹 Cleanup: unmounting useProductsManager");
            mountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        products,
        categories,
        loading,
        isRefreshing,
        refreshProducts,
        updateProductLocally,
        addProductLocally,
        removeProductLocally,
    };
};
