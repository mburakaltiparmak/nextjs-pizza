import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { fetchProducts } from '@/lib/store/actions/productActions';
import { fetchCategories } from '@/lib/store/actions/categoryActions';
import { setLoading, setError } from '@/lib/store/actions/globalActions';

export const useHomeData = () => {
    const dispatch = useDispatch();
    const loading = useSelector(state => state.global.loading);

    // Selectors to check if data is already loaded
    const products = useSelector(state => state.product.products);
    const categories = useSelector(state => state.category.categories);

    const loadHomeData = useCallback(async () => {
        // Optimization: Don't fetch if we already have data
        if (products.length > 0 && categories.length > 0) {
            return;
        }

        dispatch(setLoading(true));
        try {
            await Promise.all([
                dispatch(fetchProducts()),
                dispatch(fetchCategories())
            ]);
        } catch (error) {
            console.error("Error loading home data:", error);
            dispatch(setError("Veriler yüklenirken bir hata oluştu."));
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch, products.length, categories.length]);

    return {
        loading,
        loadHomeData
    };
};
