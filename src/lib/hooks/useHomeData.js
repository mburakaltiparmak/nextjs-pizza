import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { fetchProducts, fetchGetAllProducts } from '@/lib/store/actions/productActions';
import { fetchCategories } from '@/lib/store/actions/categoryActions';
import { setLoading, setError } from '@/lib/store/actions/globalActions';

export const useHomeData = () => {
    const dispatch = useDispatch();
    const loading = useSelector(state => state.global.loading);

    // Selectors to check if data is already loaded
    const products = useSelector(state => state.product.products);
    const categories = useSelector(state => state.category.categories);
    const productPagination = useSelector(state => state.product.pagination);

    const loadHomeData = useCallback(async () => {
        // Optimization: Don't fetch if we already have data and pagination info
        // We check if totalPages is set to ensure we have pagination metadata
        if (products.length > 0 && categories.length > 0 && productPagination?.totalPages > 0) {
            return;
        }

        dispatch(setLoading(true));
        try {
            await Promise.all([
                // Fetch ALL products for client-side filtering (91 products total)
                // Using helper to fetch all pages if backend limits response size
                dispatch(fetchGetAllProducts(100)),
                dispatch(fetchCategories(0, 100))
            ]);
        } catch (error) {
            console.error("Error loading home data:", error);
            dispatch(setError("Veriler yüklenirken bir hata oluştu."));
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch, products.length, categories.length, productPagination?.totalPages]);

    return {
        loading,
        loadHomeData
    };
};
