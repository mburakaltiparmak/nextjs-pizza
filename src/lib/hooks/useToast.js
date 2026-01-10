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

    return {
        toast,
        success: (message, options = {}) =>
            addToast({ type: 'success', message, ...options }),

        error: (message, options = {}) =>
            addToast({ type: 'error', message, ...options }),

        warning: (message, options = {}) =>
            addToast({ type: 'warning', message, ...options }),

        info: (message, options = {}) =>
            addToast({ type: 'info', message, ...options }),

        cartNotification: (product, options = {}) =>
            addToast({ type: 'cart', product, ...options }),

        dismiss: removeToast,
        dismissAll: clearAllToasts
    };
};

export { ToastContext };
