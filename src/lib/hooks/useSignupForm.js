"use client";
import { useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { initiateGoogleLogin, registerUser } from "@/lib/store/actions/userActions";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/hooks/useToast";

export const useSignupForm = (onSuccess) => {
    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
    });
    const [localError, setLocalError] = useState("");
    const [touched, setTouched] = useState({
        name: false,
        surname: false,
        email: false,
        phoneNumber: false,
        password: false,
        confirmPassword: false,
    });

    const dispatch = useAppDispatch();
    const router = useRouter();
    const { toast } = useToast();
    const loading = useAppSelector((state) => state.global.loading);

    const fieldValidations = useMemo(() => {
        const { name, surname, email, phoneNumber, password, confirmPassword } = formData;
        const isValidEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        return {
            name: name.trim() !== "",
            surname: surname.trim() !== "",
            email: isValidEmailFormat,
            phoneNumber: /^\d{1,11}$/.test(phoneNumber),
            password: password.length >= 6,
            confirmPassword: password === confirmPassword && password.length >= 8,
        };
    }, [formData]);

    const isFormValid = useMemo(() => {
        return Object.values(fieldValidations).every((validation) => validation);
    }, [fieldValidations]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setTouched((prev) => ({ ...prev, [name]: true }));
        if (localError) setLocalError("");
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isValid = Object.entries(fieldValidations).every(([field, isValid]) => {
            if (!isValid) setTouched((prev) => ({ ...prev, [field]: true }));
            return isValid;
        });

        if (!isValid) return;

        const { confirmPassword, ...registrationData } = formData;

        try {
            const result = await dispatch(registerUser(registrationData));

            if (result && result.success) {
                let message = "Kayıt işlemi başarıyla tamamlandı!";
                if (result.timeout) {
                    message = "Kayıt işlemi alındı! Sunucu geç yanıt verdi. Lütfen e-postanızı kontrol edin.";
                }

                toast({
                    title: "Başarılı",
                    description: message,
                    type: "success",
                    duration: 5000,
                });

                if (onSuccess) onSuccess();
            } else if (result && result.error) {
                const errorMap = {
                    "Bu email zaten kullanılıyor": "Bu e-posta adresi zaten kayıtlı.",
                    default: "Kayıt işlemi sırasında bir hata oluştu",
                };
                const errorMessage = errorMap[result.error] || errorMap.default;
                setLocalError(errorMessage);
                toast({ title: "Hata", description: errorMessage, type: "error" });
            }
        } catch (error) {
            const errorMessage = "Beklenmeyen bir hata oluştu";
            setLocalError(errorMessage);
            toast({ title: "Hata", description: errorMessage, type: "error" });
        }
    };

    const handleGoogleLogin = () => {
        localStorage.setItem("rememberMe", true);
        dispatch(initiateGoogleLogin());
    };

    return {
        formData,
        touched,
        loading,
        fieldValidations,
        isFormValid,
        localError,
        handleChange,
        handleBlur,
        handleSubmit,
        handleGoogleLogin,
    };
};
