import { useState, useCallback } from 'react';

export const useLoadingManager = (initialState = {}) => {
    const [loadingStates, setLoadingStates] = useState(initialState);

    const startLoading = useCallback((key) => {
        setLoadingStates((prev) => ({ ...prev, [key]: true }));
    }, []);

    const stopLoading = useCallback((key) => {
        setLoadingStates((prev) => ({ ...prev, [key]: false }));
    }, []);

    const isLoading = useCallback((key) => {
        return !!loadingStates[key];
    }, [loadingStates]);

    const toggleLoading = useCallback((key) => {
        setLoadingStates((prev) => ({ ...prev, [key]: !prev[key] }));
    }, []);

    return {
        startLoading,
        stopLoading,
        isLoading,
        toggleLoading,
        loadingStates
    };
};
