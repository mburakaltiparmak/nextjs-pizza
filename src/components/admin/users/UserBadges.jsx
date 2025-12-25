import { Check, X, AlertTriangle, User, Shield } from "lucide-react";

/**
 * Status Badge Component
 */
export const StatusBadge = ({ status }) => {
    const badges = {
        ACTIVE: (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Check size={12} className="mr-1" />
                Aktif
            </span>
        ),
        PENDING: (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <AlertTriangle size={12} className="mr-1" />
                Onay Bekliyor
            </span>
        ),
        LOCKED: (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red">
                <X size={12} className="mr-1" />
                Kilitli
            </span>
        ),
        REJECTED: (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <X size={12} className="mr-1" />
                Reddedildi
            </span>
        ),
    };

    return (
        badges[status] || (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {status || "Bilinmiyor"}
            </span>
        )
    );
};

/**
 * Role Badge Component
 */
export const RoleBadge = ({ role }) => {
    const badges = {
        ADMIN: (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <Shield size={12} className="mr-1" />
                Admin
            </span>
        ),
        PERSONAL: (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <User size={12} className="mr-1" />
                Personel
            </span>
        ),
        CUSTOMER: (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <User size={12} className="mr-1" />
                Müşteri
            </span>
        ),
        GUEST: (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <User size={12} className="mr-1" />
                Misafir
            </span>
        ),
    };

    return (
        badges[role] || (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {role || "Bilinmiyor"}
            </span>
        )
    );
};
