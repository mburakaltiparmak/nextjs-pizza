"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { useHomeData } from "@/lib/hooks/useHomeData";
import { fetchProducts, fetchProductsByCategory, fetchGetAllProducts } from "@/lib/store/actions/productActions";
import { selectProductList } from "@/lib/store/selectors/productSelectors";
import { selectAllCategories } from "@/lib/store/selectors/categorySelectors";
import { fetchStates } from "@/lib/store/constants";
import { useDebounce } from "@/lib/hooks/useDebounce";

// Components
import FeaturedProductsSection from "./FeaturedProductsSection";
import Categories from "@/components/categories/categories";
import Products from "@/components/products/products";
import ProductFilters from "@/components/products/ProductFilters";

export default function MenuSection() {
    const dispatch = useAppDispatch();
    const { loadHomeData } = useHomeData();
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    
    // Filter states (controlled)
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sortBy, setSortBy] = useState("id,desc");

    // Debounce search term to avoid excessive filtering
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Redux selectors
    const products = useAppSelector(selectProductList);
    const categories = useAppSelector(selectAllCategories);
    const fetchState = useAppSelector((state) => state.product.fetchState);
    const globalLoading = useAppSelector((state) => state.global.loading);

    const hasProductData = Array.isArray(products) && products.length > 0;
    const hasCategoryData = Array.isArray(categories) && categories.length > 0;

    // Initial data fetch
    useEffect(() => {
        if (!isInitialLoad) return;
        
        setIsInitialLoad(false);
        if (!hasProductData && !hasCategoryData) {
            loadHomeData();
        }
    }, [isInitialLoad, hasProductData, hasCategoryData, loadHomeData]);

    // Client-side filtering with useMemo
    const filteredProducts = useMemo(() => {
        if (!products) return [];
        
        let result = [...products];

        // Search filter
        if (debouncedSearchTerm) {
            const searchLower = debouncedSearchTerm.toLowerCase();
            result = result.filter(product =>
                product.name.toLowerCase().includes(searchLower) ||
                product.description?.toLowerCase().includes(searchLower)
            );
        }

        // Price filters
        if (minPrice) {
            const min = Number(minPrice);
            result = result.filter(product => product.price >= min);
        }
        if (maxPrice) {
            const max = Number(maxPrice);
            result = result.filter(product => product.price <= max);
        }

        // Sorting
        result.sort((a, b) => {
            const [field, order] = sortBy.split(",");
            
            let comparison = 0;
            if (field === "price") {
                comparison = Number(a.price) - Number(b.price);
            } else if (field === "name") {
                comparison = a.name.localeCompare(b.name);
            } else if (field === "id") {
                comparison = a.id - b.id;
            }
            
            return order === "desc" ? -comparison : comparison;
        });

        return result;
    }, [products, debouncedSearchTerm, minPrice, maxPrice, sortBy]);

    // Category change handler
    const handleCategorySelect = (id) => {
        setSelectedCategoryId(id);
        // Fetch new products for category
        if (id) {
            // For specific category, 1000 size is likely fine as categories usually have < 50 items
            // But ideally we should have a recursive fetch for categories too if needed
            dispatch(fetchProductsByCategory(id, 0, 1000));
        } else {
            // Fetch ALL products recursively when "All" is selected
            dispatch(fetchGetAllProducts(100));
        }
    };

    // Clear all filters
    const handleClearFilters = () => {
        setSearchTerm("");
        setMinPrice("");
        setMaxPrice("");
        setSortBy("id,desc");
    };

    const isSearching = searchTerm !== debouncedSearchTerm;
    const isLoading = isInitialLoad || fetchState === fetchStates.FETCHING || fetchState === fetchStates.NOT_FETCHED || isSearching;
    
    // Client-side Infinite Scroll
    const [visibleCount, setVisibleCount] = useState(8);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    
    // Reset visible count when filters change
    useEffect(() => {
        setVisibleCount(8);
        setIsLoadingMore(false);
    }, [selectedCategoryId, debouncedSearchTerm, minPrice, maxPrice, sortBy]);

    const visibleProducts = useMemo(() => {
        return filteredProducts.slice(0, visibleCount);
    }, [filteredProducts, visibleCount]);

    // Intersection Observer for loading more
    const observerTarget = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && !isLoadingMore && visibleCount < filteredProducts.length) {
                   setIsLoadingMore(true);
                   // Artificial delay for premium feel
                   setTimeout(() => {
                       setVisibleCount((prev) => Math.min(prev + 8, filteredProducts.length));
                       setIsLoadingMore(false);
                   }, 1000);
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [visibleCount, filteredProducts.length, isLoadingMore]);

    return (
        <div id="menu" className="flex flex-col items-center gap-12 md:gap-24 w-full max-w-7xl mx-auto px-4 md:px-8 pb-24">
            <FeaturedProductsSection />
            
            <Categories
                selectedCategoryId={selectedCategoryId}
                onCategorySelect={handleCategorySelect}
            />
            
            <ProductFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                minPrice={minPrice}
                onMinPriceChange={setMinPrice}
                maxPrice={maxPrice}
                onMaxPriceChange={setMaxPrice}
                sort={sortBy}
                onSortChange={setSortBy}
                onClearAll={handleClearFilters}
            />
            
            <Products
                products={visibleProducts}
                loading={isLoading}
            />
            
            {/* Infinite Scroll Sentinel */}
            {!isLoading && visibleCount < filteredProducts.length && (
                <div ref={observerTarget} className="w-full h-20 flex items-center justify-center transition-opacity duration-300">
                    {/* Always render sentinel space, but only show spinner when loading more */}
                    {isLoadingMore && (
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red"></div>
                    )}
                </div>
            )}
        </div>
    );
}
