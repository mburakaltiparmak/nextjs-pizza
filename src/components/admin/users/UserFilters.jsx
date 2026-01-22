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
import { USER_ROLES, USER_ROLE_LABELS, USER_STATUS, USER_STATUS_LABELS } from "@/lib/utils/adminConstants";

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
    loading,
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
                        disabled={loading}
                    />
                </div>

                {/* Role Filter */}
                <Select value={roleFilter} onValueChange={onRoleChange} disabled={loading}>
                    <SelectTrigger className="w-full md:w-48 font-Barlow">
                        <SelectValue placeholder="Rol Filtrele" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(USER_ROLES).map(([key, value]) => (
                            <SelectItem key={value} value={value}>
                                {USER_ROLE_LABELS[value]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={onStatusChange} disabled={loading}>
                    <SelectTrigger className="w-full md:w-48 font-Barlow">
                        <SelectValue placeholder="Durum Filtrele" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(USER_STATUS).map(([key, value]) => (
                            <SelectItem key={value} value={value}>
                                {USER_STATUS_LABELS[value]}
                            </SelectItem>
                        ))}
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
