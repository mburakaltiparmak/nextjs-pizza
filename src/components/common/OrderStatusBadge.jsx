import React from 'react';
import { useOrderStatus } from '@/lib/hooks/useOrderStatus';

export const OrderStatusBadge = ({ status, className = "" }) => {
    const { getStatusConfig, getStatusColor } = useOrderStatus();
    
    if (!status) return null;

    const config = getStatusConfig(status);
    const colorClass = getStatusColor(status);
    
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colorClass} ${className}`}>
             {config?.icon && <span className="mr-1.5 text-sm">{config.icon}</span>}
            {config?.label || status}
        </span>
    );
};
