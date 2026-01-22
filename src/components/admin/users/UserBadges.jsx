import { Check, X, AlertTriangle, User, Shield } from "lucide-react";
import { USER_STATUS_CONFIG, USER_ROLE_CONFIG } from "@/lib/utils/adminConstants";

/**
 * Status Badge Component
 */
export const StatusBadge = ({ status }) => {
    const config = USER_STATUS_CONFIG[status] || {
        label: status || "Bilinmiyor",
        color: "bg-gray-100 text-gray-800",
        iconName: null
    };

    // Icon mapping
    const iconMap = {
        Check,
        X,
        AlertTriangle,
        Ban: X // Using X as fallback for Ban
    };

    const Icon = config.iconName ? iconMap[config.iconName] : null;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            {Icon && <Icon size={12} className="mr-1" />}
            {config.label}
        </span>
    );
};

/**
 * Role Badge Component
 */
export const RoleBadge = ({ role }) => {
    const config = USER_ROLE_CONFIG[role] || {
        label: role || "Bilinmiyor",
        color: "bg-gray-100 text-gray-800",
        iconName: null
    };

    // Icon mapping
    const iconMap = {
        Shield,
        User
    };

    const Icon = config.iconName ? iconMap[config.iconName] : null;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            {Icon && <Icon size={12} className="mr-1" />}
            {config.label}
        </span>
    );
};
