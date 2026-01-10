"use client";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/hooks/useToast";
import {
    login,
    checkAuthStatus,
    initiateGoogleLogin,
    forgotPassword,
    logout
} from "@/lib/store/actions/userActions";

export const useUserButton = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { success, error: showError } = useToast();

    // Redux state
    const isLogin = useSelector((state) => state.user.isLogin);
    const userEmail = useSelector((state) => state.user.email);
    const name = useSelector((state) => state.user.profile?.name);
    const loading = useSelector((state) => state.global.loading);
    const role = useSelector((state) => state.user.role);
    const authProvider = useSelector((state) => state.user.authProvider);

    // Local state
    const [loginOpen, setLoginOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isClient, setIsClient] = useState(false);

    const dropdownRef = useRef(null);

    // Hydration fix
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Check auth status on mount
    useEffect(() => {
        dispatch(checkAuthStatus());
    }, [dispatch]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // ESC key handler
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === "Escape") {
                if (loginOpen) setLoginOpen(false);
                if (forgotPasswordOpen) setForgotPasswordOpen(false);
            }
        };

        document.addEventListener("keydown", handleEscKey);
        return () => {
            document.removeEventListener("keydown", handleEscKey);
        };
    }, [loginOpen, forgotPasswordOpen]);

    // Handlers
    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);

            // Logout action'ını çağır
            await dispatch(logout());

            setDropdownOpen(false);

            success("Başarıyla çıkış yaptınız", {
                title: "Çıkış Yapıldı"
            });

            // Yönlendirmeyi geciktir
            setTimeout(() => {
                router.push("/");
            }, 100);
        } catch (error) {
            console.error("Çıkış yapma hatası:", error);
            showError("Çıkış yapılırken bir sorun oluştu", {
                title: "Hata"
            });
            setIsLoggingOut(false);
        }
    };

    const handleNavigation = (path) => {
        router.push(path);
        setDropdownOpen(false);
    };

    // Computed values
    const isAdminOrPersonal = role === "ADMIN" || role === "PERSONAL";
    const displayName = name || userEmail;

    return {
        // State
        isLogin,
        userEmail,
        name,
        loading,
        role,
        authProvider,
        isClient,
        loginOpen,
        setLoginOpen,
        dropdownOpen,
        setDropdownOpen,
        forgotPasswordOpen,
        setForgotPasswordOpen,
        isLoggingOut,
        dropdownRef,

        // Computed
        isAdminOrPersonal,
        displayName,

        // Handlers
        handleLogout,
        handleNavigation,

        // Utils
        dispatch,
        router,
        success,
        showError,
    };
};
