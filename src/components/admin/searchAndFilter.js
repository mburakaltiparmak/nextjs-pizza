"use client";
import { Search, Filter } from "lucide-react";

// Arama bileşeni
export const SearchBar = ({ value, onChange, placeholder = "Ara..." }) => {
  return (
    <div className="relative flex-1 w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={18} className="text-gray" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

// Kategori filtre bileşeni
export const CategoryFilter = ({
  category,
  value,
  onChange,
  placeholder = "Tüm Kategoriler",
}) => {
  return (
    <div className="relative w-full md:w-64">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Filter size={18} className="text-gray" />
      </div>
      <select
        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent appearance-none"
        value={value}
        onChange={onChange}
      >
        <option value="">{placeholder}</option>
        {Array.isArray(category) &&
          category.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
      </select>
    </div>
  );
};

// Arama ve Filtreleme container
export const SearchFilterContainer = ({ children }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col md:flex-row items-center gap-4 border border-lightgray">
      {children}
    </div>
  );
};
