"use client";
import React from "react";
import { LoginDialog } from "../user-button/LoginDialog";
import { SignupDialog } from "../user-button/SignupDialog";
import { ForgotPasswordDialog } from "../user-button/ForgotPasswordDialog";
import { useLoginForm } from "@/lib/hooks/useLoginForm";
import { useSignupForm } from "@/lib/hooks/useSignupForm";
import { useForgotPassword } from "@/lib/hooks/useForgotPassword";

export const SidebarAuthDialogs = ({
    loginOpen,
    setLoginOpen,
    signupOpen,
    setSignupOpen,
    forgotPasswordOpen,
    setForgotPasswordOpen,
    onGuestCheckout,
    authLoading,
    refreshAuth,
    onLoginSuccess
}) => {
    
    // Forms
    const loginForm = useLoginForm(async () => {
        setLoginOpen(false);
        if (onLoginSuccess) onLoginSuccess();
        await refreshAuth();
    });

    const signupFormProps = useSignupForm(async () => {
        setSignupOpen(false);
        if (onLoginSuccess) onLoginSuccess();
        await refreshAuth();
    });

    const forgotPassword = useForgotPassword();

    const handleForgotPasswordClick = () => {
        setLoginOpen(false);
        setForgotPasswordOpen(true);
        forgotPassword.setForgotPasswordEmail(loginForm.email);
    };

    const handleBackToLogin = () => {
        setForgotPasswordOpen(false);
        setLoginOpen(true);
    };

    const openSignup = () => {
        setLoginOpen(false);
        setSignupOpen(true);
    };

    const openLogin = () => {
        setSignupOpen(false);
        setLoginOpen(true);
    };

    return (
        <>
            <LoginDialog
                loginOpen={loginOpen}
                setLoginOpen={setLoginOpen}
                onGuestCheckout={onGuestCheckout}
                email={loginForm.email}
                setEmail={loginForm.setEmail}
                password={loginForm.password}
                setPassword={loginForm.setPassword}
                rememberMe={loginForm.rememberMe}
                setRememberMe={loginForm.setRememberMe}
                errorMessage={loginForm.errorMessage}
                handleInputChange={loginForm.handleInputChange}
                handleLogin={loginForm.handleLogin}
                handleGoogleLogin={loginForm.handleGoogleLogin}
                loading={authLoading}
                onForgotPassword={handleForgotPasswordClick}
                onSignupClick={openSignup}
            />

            <SignupDialog
                signupOpen={signupOpen}
                setSignupOpen={setSignupOpen}
                onLoginClick={openLogin}
                {...signupFormProps}
            />

            <ForgotPasswordDialog
                forgotPasswordOpen={forgotPasswordOpen}
                setForgotPasswordOpen={setForgotPasswordOpen}
                forgotPasswordEmail={forgotPassword.forgotPasswordEmail}
                setForgotPasswordEmail={forgotPassword.setForgotPasswordEmail}
                forgotPasswordError={forgotPassword.forgotPasswordError}
                setForgotPasswordError={forgotPassword.setForgotPasswordError}
                forgotPasswordSuccess={forgotPassword.forgotPasswordSuccess}
                handleForgotPassword={forgotPassword.handleForgotPassword}
                loading={authLoading}
                onBackToLogin={handleBackToLogin}
                resetForgotPassword={forgotPassword.resetForgotPassword}
            />
        </>
    );
};
