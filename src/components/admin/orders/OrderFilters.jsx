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

export const OrderFilters = ({
    statusFilter,
    searchTerm,
    onStatusChange,
    onSearchChange,
    onReset,
    stats,
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-lightgray">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-full md:w-56 font-Barlow">
                        <SelectValue placeholder="Durum Filtrele" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tümü ({stats?.total || 0})</SelectItem>
                        <SelectItem value="PENDING">Beklemede ({stats?.pending || 0})</SelectItem>
                        <SelectItem value="CONFIRMED">Onaylandı ({stats?.confirmed || 0})</SelectItem>
                        <SelectItem value="PREPARING">Hazırlanıyor ({stats?.preparing || 0})</SelectItem>
                        <SelectItem value="SHIPPING">Yolda ({stats?.shipping || 0})</SelectItem>
                        <SelectItem value="DELIVERED">Teslim Edildi ({stats?.delivered || 0})</SelectItem>
                        <SelectItem value="CANCELLED">İptal Edildi ({stats?.cancelled || 0})</SelectItem>
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
