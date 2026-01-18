"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { useHomeData } from "@/lib/hooks/useHomeData";
import { fetchProducts, fetchProductsByCategory } from "@/lib/store/actions/productActions";
import { selectProductList } from "@/lib/store/selectors/productSelectors";
import { selectAllCategories } from "@/lib/store/selectors/categorySelectors";

// Components
import FeaturedProductsSection from "./FeaturedProductsSection";
import Categories from "@/components/categories/categories";
import Products from "@/components/products/products";

export default function MenuSection() {
    const dispatch = useAppDispatch();
    const { loadHomeData } = useHomeData();
    const [dataInitialized, setDataInitialized] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);

    // We check store directly to avoid redundant fetching if data exists

    const products = useAppSelector(selectProductList);
    const categories = useAppSelector(selectAllCategories);

    const hasProductData = Array.isArray(products) && products.length > 0;
    const hasCategoryData = Array.isArray(categories) && categories.length > 0;

    useEffect(() => {
        // Only fetch if we don't have data
        if (!dataInitialized && !hasProductData && !hasCategoryData) {
            setDataInitialized(true);
            loadHomeData();
        }
    }, [dataInitialized, hasProductData, hasCategoryData, loadHomeData]);

    const handleCategorySelect = (id) => {
        setSelectedCategoryId(id);
        // Reset product page to 0 when category changes and fetch new data
        if (id) {
            dispatch(fetchProductsByCategory(id, 0));
        } else {
            dispatch(fetchProducts(0));
        }
    };

    const handleProductPageChange = (page) => {
        if (selectedCategoryId) {
            dispatch(fetchProductsByCategory(selectedCategoryId, page));
        } else {
            dispatch(fetchProducts(page));
        }
    };

    return (
        <div id="menu" className="flex flex-col items-center gap-12 md:gap-24 w-full max-w-7xl mx-auto px-4 md:px-8 pb-24">
            <FeaturedProductsSection />
            <Categories
                selectedCategoryId={selectedCategoryId}
                onCategorySelect={handleCategorySelect}
            />
            <Products
                categoryFilter={selectedCategoryId ? selectedCategoryId.toString() : ""}
                onPageChange={handleProductPageChange}
            />
        </div>
    );
}
