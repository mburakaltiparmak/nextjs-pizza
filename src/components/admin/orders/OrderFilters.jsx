"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS, ORDER_STATUS_LABELS } from "@/lib/utils/adminConstants";

export const OrderFilters = ({
    statusFilter,
    searchTerm,
    onStatusChange,
    onSearchChange,
    onReset,
    stats,
    loading,
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-lightgray">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={onStatusChange} disabled={loading}>
                    <SelectTrigger className="w-full md:w-56 font-Barlow">
                        <SelectValue placeholder="Durum Filtrele" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(ORDER_STATUS).map(([key, value]) => {
                            const count = stats?.[key.toLowerCase()];
                            return (
                                <SelectItem key={value} value={value}>
                                    {ORDER_STATUS_LABELS[value]} {loading ? "" : count !== undefined ? `(${count})` : ""}
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>

                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="Sipariş No, Müşteri veya Adres Ara..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 font-Barlow"
                    />
                </div>

                {/* Reset Button */}
                {(statusFilter !== "ALL" || searchTerm) && (
                    <Button
                        variant="outline"
                        onClick={onReset}
                        className="font-Barlow whitespace-nowrap"
                    >
                        Filtreleri Temizle
                    </Button>
                )}
            </div>
        </div>
    );
};
