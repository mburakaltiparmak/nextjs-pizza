"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { useToast } from "@/lib/hooks/useToast";
import { clearMessages } from "@/lib/store/actions/globalActions";

export const GlobalMessageListener = () => {
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    const { success, error } = useAppSelector((state) => state.global);

    // Success handling
    useEffect(() => {
        if (success) {
            toast.success(success);
            // Clear message immediately from store so it doesn't persist
            dispatch(clearMessages());
        }
    }, [success, toast, dispatch]);

    // Error handling
    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearMessages());
        }
    }, [error, toast, dispatch]);

    return null;
};
