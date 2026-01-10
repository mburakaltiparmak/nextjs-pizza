"use client";

import { Search, Filter, X } from "lucide-react";

export const SearchBar = ({ value, onChange, placeholder = "Ara..." }) => {
    return (
        <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-lightgray rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red focus:border-red sm:text-sm font-Barlow transition duration-150 ease-in-out"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    );
};

export const FilterDropdown = ({
    icon = <Filter className="h-4 w-4 mr-2" />,
    label,
    options,
    value,
    onChange,
}) => {
    return (
        <div className="relative inline-block text-left">
            <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 font-Barlow hidden sm:block">
                    {label}:
                </label>
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red focus:border-red sm:text-sm rounded-md font-Barlow"
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export const ActiveFilters = ({ filters, onRemove }) => {
    if (!filters || filters.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {filters.map((filter) => (
                <span
                    key={filter.key}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red text-lightgray font-Barlow"
                >
                    {filter.label}: {filter.valueLabel}
                    <button
                        onClick={() => onRemove(filter.key)}
                        className="ml-1 inline-flex items-center bg-red rounded-full p-0.5 text-lightgray hover:bg-yellow hover:text-red focus:outline-none"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </span>
            ))}
        </div>
    );
};
