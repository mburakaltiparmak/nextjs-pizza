import React from 'react';
import { useOrderStatus } from '@/lib/hooks/useOrderStatus';

export const OrderStatusBadge = ({ status, className = "" }) => {
    const { getStatusConfig, getStatusColor } = useOrderStatus();
    
    if (!status) return null;

    const config = getStatusConfig(status);
    const colorClass = getStatusColor(status);
    
    // Config icon can be a string (emoji) or null if FA icon is handled differently.
    // Based on previous files, config used to have FA icons but we are moving/simplifying.
    // Assuming config might have an icon property which is an object or component.
    // Ideally we pass icon as prop or handle it here if it's in config.
    
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colorClass} ${className}`}>
             {config?.icon && <span className="mr-1.5 text-sm">{config.icon}</span>}
            {config?.label || status}
        </span>
    );
};
