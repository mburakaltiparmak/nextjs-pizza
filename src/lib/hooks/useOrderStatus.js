import { getOrderStatusConfig, getOrderStatusDisplay } from '@/lib/constants';

export const useOrderStatus = () => {
    
    const getStatusConfig = (status) => {
        return getOrderStatusConfig(status);
    };

    const getStatusDisplay = (status) => {
        return getOrderStatusDisplay(status);
    };

    const getStatusColor = (status) => {
        const config = getOrderStatusConfig(status);
        return config?.color || "bg-gray text-white";
    };

    const getStatusIcon = (status) => {
         const config = getOrderStatusConfig(status);
         return config?.icon || null;
    };

    return {
        getStatusConfig,
        getStatusDisplay,
        getStatusColor,
        getStatusIcon
    };
};
