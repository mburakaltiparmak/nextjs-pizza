"use client";
import { useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { initiateGoogleLogin, registerUser } from "@/lib/store/actions/userActions";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/hooks/useToast";
import { registerSchema, registerBaseSchema } from "@/lib/validations/auth";

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
        // Use Zod schema to determine field validity
        // We prefer granular checks for UI feedback
        const { name, surname, email, phoneNumber, password, confirmPassword } = formData;

        // Helper to check a specific field against the schema
        const checkField = (field, value) => {
            const fieldSchema = registerBaseSchema.shape[field];
            if (!fieldSchema) return true; // if no schema, assume valid? or false?
            const result = fieldSchema.safeParse(value);
            return result.success;
        };

        const isNameValid = checkField("name", name);
        const isSurnameValid = checkField("surname", surname);
        const isEmailValid = checkField("email", email);
        const isPhoneValid = checkField("phoneNumber", phoneNumber);
        const isPasswordValid = checkField("password", password);
        // confirmPassword needs custom check because it depends on password, which isn't in shape alone
        const isConfirmValid = password === confirmPassword && confirmPassword.length >= 6;

        return {
            name: isNameValid,
            surname: isSurnameValid,
            email: isEmailValid,
            phoneNumber: isPhoneValid,
            password: isPasswordValid,
            confirmPassword: isConfirmValid,
        };
    }, [formData]);

    const isFormValid = useMemo(() => {
        // Validate entire form for submit button
        const result = registerSchema.safeParse(formData);
        return result.success;
    }, [formData]);

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
