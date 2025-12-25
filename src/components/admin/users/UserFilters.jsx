import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

/**
 * User Filters Component
 * Search and filter controls for users table
 */
export const UserFilters = ({
    searchTerm,
    roleFilter,
    statusFilter,
    onSearchChange,
    onRoleChange,
    onStatusChange,
    onReset,
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-lightgray">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="İsim, email veya telefon ile ara..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 font-Barlow"
                    />
                </div>

                {/* Role Filter */}
                <Select value={roleFilter} onValueChange={onRoleChange}>
                    <SelectTrigger className="w-full md:w-48 font-Barlow">
                        <SelectValue placeholder="Rol Filtrele" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tüm Roller</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="PERSONAL">Personel</SelectItem>
                        <SelectItem value="CUSTOMER">Müşteri</SelectItem>
                        <SelectItem value="GUEST">Misafir</SelectItem>
                    </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-full md:w-48 font-Barlow">
                        <SelectValue placeholder="Durum Filtrele" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tüm Durumlar</SelectItem>
                        <SelectItem value="ACTIVE">Aktif</SelectItem>
                        <SelectItem value="PENDING">Onay Bekliyor</SelectItem>
                        <SelectItem value="LOCKED">Kilitli</SelectItem>
                        <SelectItem value="REJECTED">Reddedildi</SelectItem>
                    </SelectContent>
                </Select>

                {/* Reset Button */}
                {(searchTerm || roleFilter !== "ALL" || statusFilter !== "ALL") && (
                    <Button
                        variant="outline"
                        onClick={onReset}
                        className="w-full md:w-auto font-Barlow"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Sıfırla
                    </Button>
                )}
            </div>
        </div>
    );
};
