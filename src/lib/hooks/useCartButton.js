"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import {
    removeFromCart,
    updateCartItem,
} from "@/lib/store/actions/orderActions";

import { selectCartItems } from "@/lib/store/selectors/orderSelectors";

// Özel event ismi - Toast'tan sepeti açmak için
const OPEN_CART_EVENT = "open_floating_cart";

export const useCartButton = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const cart = useAppSelector(selectCartItems);

    const [isOpen, setIsOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const triggerButtonRef = useRef(null);

    // Hydration fix
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Custom event listener - Toast'tan sepeti açmak için
    useEffect(() => {
        const handleOpenCartEvent = () => {
            setIsOpen(true);
            if (triggerButtonRef.current) {
                triggerButtonRef.current.click();
            }
        };

        window.addEventListener(OPEN_CART_EVENT, handleOpenCartEvent);

        return () => {
            window.removeEventListener(OPEN_CART_EVENT, handleOpenCartEvent);
        };
    }, []);

    // Computed values - useMemo ile optimize edilmiş
    const totalItems = useMemo(() => {
        if (!isClient) return 0;
        return cart.reduce((sum, item) => sum + item.count, 0);
    }, [isClient, cart]);

    const totalAmount = useMemo(() => {
        if (!isClient) return 0;
        return cart.reduce((sum, item) => sum + item.product.price * item.count, 0);
    }, [isClient, cart]);

    const hasItems = isClient && cart.length > 0;

    // Handlers
    const handleCheckout = () => {
        router.push("/checkout");
        setIsOpen(false);
    };

    const handleUpdateQuantity = (itemId, currentCount, operation) => {
        if (operation === "increase") {
            dispatch(updateCartItem(itemId, currentCount + 1));
        } else if (operation === "decrease" && currentCount > 1) {
            dispatch(updateCartItem(itemId, currentCount - 1));
        }
    };

    const handleRemoveItem = (itemId) => {
        dispatch(removeFromCart(itemId));
    };

    return {
        // State
        cart,
        isOpen,
        setIsOpen,
        isClient,
        triggerButtonRef,

        // Computed
        totalItems,
        totalAmount,
        hasItems,

        // Handlers
        handleCheckout,
        handleUpdateQuantity,
        handleRemoveItem,
    };
};
