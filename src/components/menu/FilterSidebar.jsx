"use client";

import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export const FilterSidebar = ({
    categories,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    inStock,
    setInStock,
    sortOption,
    setSortOption,
    minPrice = 0,
    maxPrice = 1000,
}) => {
    // Local state for smoother slider interaction
    const [localPriceRange, setLocalPriceRange] = useState(priceRange);

    useEffect(() => {
        setLocalPriceRange(priceRange);
    }, [priceRange]);

    const handlePriceChange = (value) => {
        setLocalPriceRange(value);
    };

    const handlePriceCommit = (value) => {
        setPriceRange(value);
    };

    const clearFilters = () => {
        setSelectedCategory("all");
        setPriceRange([minPrice, maxPrice]);
        setInStock(false);
        setSortOption("default");
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h3 className="font-Barlow font-bold text-xl text-darkgray">Filtrele</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red hover:text-darkred font-Barlow text-xs h-8">
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Temizle
                </Button>
            </div>

            {/* Sort */}
            <div className="space-y-3">
                <Label className="font-Barlow font-semibold text-gray-700">Sıralama</Label>
                <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sıralama Seç" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="default">Varsayılan</SelectItem>
                        <SelectItem value="priceAsc">Fiyat Artan</SelectItem>
                        <SelectItem value="priceDesc">Fiyat Azalan</SelectItem>
                        <SelectItem value="newest">En Yeniler</SelectItem>
                        <SelectItem value="rating">Puana Göre</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Categories */}
            <div className="space-y-3">
                <Label className="font-Barlow font-semibold text-gray-700">Kategoriler</Label>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    <button
                        onClick={() => setSelectedCategory("all")}
                        className={`text-left text-sm py-1.5 px-3 rounded-md transition-colors ${selectedCategory === "all"
                            ? "bg-yellow text-red font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        Tümü
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id.toString())}
                            className={`text-left text-sm py-1.5 px-3 rounded-md transition-colors ${selectedCategory === cat.id.toString()
                                ? "bg-yellow text-red font-medium"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="font-Barlow font-semibold text-gray-700">Fiyat Aralığı</Label>
                    <span className="text-xs font-medium text-gray-500">
                        {localPriceRange[0]}₺ - {localPriceRange[1]}₺
                    </span>
                </div>
                <Slider
                    defaultValue={[minPrice, maxPrice]}
                    value={localPriceRange}
                    min={minPrice}
                    max={maxPrice}
                    step={10}
                    onValueChange={handlePriceChange}
                    onValueCommit={handlePriceCommit}
                    className="py-4"
                />
            </div>

            {/* Stock */}
            <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                    id="stock"
                    checked={inStock}
                    onCheckedChange={setInStock}
                />
                <Label
                    htmlFor="stock"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                    Sadece Stoktakiler
                </Label>
            </div>
        </div>
    );
};
