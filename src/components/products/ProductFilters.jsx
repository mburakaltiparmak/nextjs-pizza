"use client";

import React from "react";
import { Search, X, Filter } from "lucide-react";

const ProductFilters = ({ 
  searchTerm,
  onSearchChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  sort,
  onSortChange,
  onClearAll
}) => {
  const hasActiveFilters = searchTerm || minPrice || maxPrice || sort !== "id,desc";

  return (
    <div className="w-full bg-white rounded-xl shadow-md border-2 border-lightgray/50 p-5 md:p-6 mb-8 font-Barlow animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-4 text-darkgray">
        <Filter className="h-5 w-5 text-red" />
        <h3 className="font-bold text-lg">Filtrele & Sırala</h3>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500 group-focus-within:text-red transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border-2 border-lightgray rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-red focus:bg-white focus:ring-0 sm:text-sm transition-all duration-300 text-darkgray font-medium"
            placeholder="Pizza, İçecek ara..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap gap-4 w-full md:w-auto items-center">
          
          {/* Price Range */}
          <div className="flex items-center gap-2 flex-grow md:flex-grow-0 bg-gray-50 p-1.5 rounded-xl border-2 border-lightgray">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 text-xs font-bold">₺</span>
              <input
                type="number"
                placeholder="Min"
                className="w-20 pl-6 pr-2 py-1.5 bg-transparent text-sm focus:outline-none text-darkgray font-semibold placeholder-gray-400"
value={minPrice}
                onChange={(e) => onMinPriceChange(e.target.value)}
                min="0"
              />
            </div>
            <span className="text-gray-400 font-bold">-</span>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 text-xs font-bold">₺</span>
              <input
                type="number"
                placeholder="Max"
                className="w-20 pl-6 pr-2 py-1.5 bg-transparent text-sm focus:outline-none text-darkgray font-semibold placeholder-gray-400"
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(e.target.value)}
                min="0"
              />
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative min-w-[160px] flex-grow md:flex-grow-0">
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none w-full pl-4 pr-10 py-3 border-2 border-lightgray rounded-xl bg-gray-50 text-darkgray text-sm font-bold focus:outline-none focus:border-red focus:bg-white cursor-pointer hover:border-gray-400 transition-colors"
            >
              <option value="id,desc">En Yeniler</option>
              <option value="price,asc">Fiyat (Artan)</option>
              <option value="price,desc">Fiyat (Azalan)</option>
              <option value="name,asc">İsim (A-Z)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <Filter className="h-4 w-4" />
            </div>
          </div>

          {/* Clear Button */}
          {hasActiveFilters && (
            <button
              onClick={onClearAll}
              className="px-4 py-3 rounded-xl text-sm font-bold text-red bg-red/10 hover:bg-red/20 transition-colors duration-200 border border-transparent whitespace-nowrap ml-auto md:ml-0"
            >
              Temizle
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
