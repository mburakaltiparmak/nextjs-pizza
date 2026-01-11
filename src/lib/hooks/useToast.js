"use client";

import { createContext, useContext } from 'react';

// Toast Context
const ToastContext = createContext();

// Toast Hook
export const useToast = () => {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }

    const { addToast, removeToast, clearAllToasts } = context;

    const toast = (options) => {
        return addToast({
            type: 'info',
            duration: 4000,
            ...options
        });
    };

    // Attach methods to toast function to allow toast.success(...) syntax
    toast.success = (message, options = {}) => addToast({ type: 'success', message, ...options });
    toast.error = (message, options = {}) => addToast({ type: 'error', message, ...options });
    toast.warning = (message, options = {}) => addToast({ type: 'warning', message, ...options });
    toast.info = (message, options = {}) => addToast({ type: 'info', message, ...options });
    toast.cartNotification = (product, options = {}) => addToast({ type: 'cart', product, ...options });
    toast.validation = (message, options = {}) => addToast({ type: 'validation', message, ...options });
    toast.dismiss = removeToast;
    toast.dismissAll = clearAllToasts;

    return {
        toast,
        // Keep these destucturable properties for backward compatibility if needed
        success: toast.success,
        error: toast.error,
        warning: toast.warning,
        info: toast.info,
        cartNotification: toast.cartNotification,
        validation: toast.validation,
        dismiss: removeToast,
        dismissAll: clearAllToasts
    };
};

export { ToastContext };
