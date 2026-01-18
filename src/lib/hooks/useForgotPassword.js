"use client";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { forgotPassword } from "@/lib/store/actions/userActions";
import { AUTH_ERRORS } from "@/lib/authErrorMessages";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export const useForgotPassword = () => {
    const dispatch = useDispatch();

    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
    const [forgotPasswordError, setForgotPasswordError] = useState("");
    const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

    const handleForgotPassword = async (e) => {
        e?.preventDefault();

        const validationResult = forgotPasswordSchema.safeParse({ email: forgotPasswordEmail });

        if (!validationResult.success) {
            setForgotPasswordError(validationResult.error.errors[0].message);
            return;
        }

        try {
            const result = await dispatch(forgotPassword(forgotPasswordEmail));

            if (result && !result.error) {
                setForgotPasswordSuccess(true);
                setForgotPasswordError("");
            } else {
                setForgotPasswordError(AUTH_ERRORS.PASSWORD_RESET_ERROR);
            }
        } catch (error) {
            setForgotPasswordError(AUTH_ERRORS.SERVER_ERROR);
        }
    };

    const resetForgotPassword = () => {
        setForgotPasswordEmail("");
        setForgotPasswordError("");
        setForgotPasswordSuccess(false);
    };

    return {
        forgotPasswordEmail,
        setForgotPasswordEmail,
        forgotPasswordError,
        setForgotPasswordError,
        forgotPasswordSuccess,
        handleForgotPassword,
        resetForgotPassword,
    };
};
