"use client";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useToast } from "@/lib/hooks/useToast";
import { login, initiateGoogleLogin } from "@/lib/store/actions/userActions";
import { loginSchema } from "@/lib/validations/auth";
import { AUTH_ERRORS } from "@/lib/authErrorMessages";

export const useLoginForm = (onSuccess) => {
    const dispatch = useDispatch();
    const { success, error: showError } = useToast();

    // Form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Load rememberMe from localStorage (client-side only)
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedRememberMe = localStorage.getItem("rememberMe") === "true";
            setRememberMe(savedRememberMe);
        }
    }, []);

    const handleInputChange = () => {
        if (errorMessage) {
            setErrorMessage("");
        }
    };

    const validateForm = () => {
        // Use Zod schema for validation
        const result = loginSchema.safeParse({ email, password });

        if (!result.success) {
            // Get the first error message
            const firstError = result.error.errors[0].message;
            setErrorMessage(firstError);
            return false;
        }

        setErrorMessage("");
        return true;
    };

    const handleLogin = async (e) => {
        e?.preventDefault();

        if (!validateForm()) {
            return;
        }

        const formData = {
            username: email,
            password: password,
            rememberMe: rememberMe,
        };

        try {
            const result = await dispatch(login(formData));

            if (result && result.error) {
                setErrorMessage(AUTH_ERRORS.INVALID_CREDENTIALS);
                showError(AUTH_ERRORS.INVALID_CREDENTIALS, {
                    title: "Giriş Hatası",
                });
            } else {
                success("Hoş geldiniz!", {
                    title: "Başarılı",
                });

                // Reset form
                setEmail("");
                setPassword("");
                setErrorMessage("");

                // Call success callback
                if (onSuccess) {
                    onSuccess();
                }
            }
        } catch (err) {
            setErrorMessage(AUTH_ERRORS.SERVER_ERROR);
            showError(AUTH_ERRORS.SERVER_ERROR, {
                title: "Hata",
            });
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const result = await dispatch(initiateGoogleLogin());
            if (result && result.redirectUrl) {
                window.location.href = result.redirectUrl;
            }
        } catch (error) {
            showError("Google ile giriş yapılırken bir hata oluştu", {
                title: "Hata",
            });
        }
    };

    return {
        email,
        setEmail,
        password,
        setPassword,
        rememberMe,
        setRememberMe,
        errorMessage,
        handleInputChange,
        handleLogin,
        handleGoogleLogin,
    };
};
