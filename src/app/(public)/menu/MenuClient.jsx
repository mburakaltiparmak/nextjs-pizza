"use client";

import { useEffect, useState, useMemo } from "react";
import { FilterSidebar } from "@/components/menu/FilterSidebar";
import Products from "@/components/products/Products";
import { useProductsManager } from "@/lib/hooks/useProductsManager";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton"; // Maybe create a GridSkeleton?
import { ProductCardSkeleton } from "@/components/ui/skeletons/ProductCardSkeleton";

const ITEMS_PER_PAGE = 8;

export default function MenuClient() {
    // Data Manager
    const { products: allProducts, categories, loading } = useProductsManager();

    // Filter States
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [inStock, setInStock] = useState(false);
    const [sortOption, setSortOption] = useState("default");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(0);

    // Initial min/max price calculation
    useEffect(() => {
        if (allProducts && allProducts.length > 0) {
            const prices = allProducts.map(p => p.price);
            const min = Math.floor(Math.min(...prices));
            const max = Math.ceil(Math.max(...prices));
            // Only update if not set by user interaction? 
            // For now, let's keep defaults or update once.
            // setPriceRange([min, max]); 
        }
    }, [allProducts]);

    // Filtering Logic
    const filteredProducts = useMemo(() => {
        if (!allProducts) return [];

        let result = [...allProducts];

        // Category Filter
        if (selectedCategory !== "all") {
            result = result.filter(
                (p) => {
                    const productCatId = p.categoryId?.toString() || p.category?.id?.toString();
                    return productCatId === selectedCategory;
                }
            );
        }

        // Price Filter
        result = result.filter(
            (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
        );

        // Stock Filter
        if (inStock) {
            result = result.filter((p) => p.stock > 0);
        }

        // Sorting
        switch (sortOption) {
            case "priceAsc":
                result.sort((a, b) => a.price - b.price);
                break;
            case "priceDesc":
                result.sort((a, b) => b.price - a.price);
                break;
            case "newest":
                result.sort((a, b) => b.id - a.id); // Assuming higher ID is newer
                break;
            case "rating":
                result.sort((a, b) => b.rating - a.rating);
                break;
            default:
                // Default order (usually ID desc or as fetched)
                break;
        }

        return result;
    }, [allProducts, selectedCategory, priceRange, inStock, sortOption]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(0);
    }, [selectedCategory, priceRange, inStock, sortOption]);

    return (
        <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full lg:w-1/4 shrink-0">
                <FilterSidebar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    inStock={inStock}
                    setInStock={setInStock}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                    minPrice={0}
                    maxPrice={2000} // Hardcoded max for now, or dynamic
                />
            </div>

            {/* Content */}
            <div className="flex-1">
                {/* Results Count */}
                <div className="mb-4 flex justify-between items-center">
                    <h2 className="font-Barlow font-bold text-2xl text-darkgray">
                        Menüler ({filteredProducts.length})
                    </h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <Products
                        products={paginatedProducts}
                        pagination={{
                            page: currentPage,
                            totalPages: totalPages,
                        }}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </div>
    );
}
