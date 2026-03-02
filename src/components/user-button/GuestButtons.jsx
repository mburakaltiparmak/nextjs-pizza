"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faUser } from "@fortawesome/free-solid-svg-icons";
import { LoginDialog } from "./LoginDialog";
import { SignupDialog } from "./SignupDialog";
import { ForgotPasswordDialog } from "./ForgotPasswordDialog";
import { useLoginForm } from "@/lib/hooks/useLoginForm";
import { useSignupForm } from "@/lib/hooks/useSignupForm";
import { useForgotPassword } from "@/lib/hooks/useForgotPassword";
import useAuth from "@/lib/hooks/useAuth";

export const GuestButtons = ({ router }) => {
  const searchParams = useSearchParams();
  const { loading: authLoading, refreshAuth } = useAuth([], "/", false);

  const [loginOpen, setLoginOpen] = React.useState(false);
  const [signupOpen, setSignupOpen] = React.useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = React.useState(false);

  // Helper to clean URL params
  const cleanUrlParams = () => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("login") || url.searchParams.has("signup")) {
        url.searchParams.delete("login");
        url.searchParams.delete("signup");
        window.history.replaceState({}, "", url.pathname);
      }
    }
  };

  const handleLoginClose = (isOpen) => {
    setLoginOpen(isOpen);
    if (!isOpen) cleanUrlParams();
  };

  const handleSignupClose = (isOpen) => {
    setSignupOpen(isOpen);
    if (!isOpen) cleanUrlParams();
  };

  // Login form state and handlers
  const loginForm = useLoginForm(async () => {
    handleLoginClose(false);
    await refreshAuth();
  });

  // Signup form state and handlers
  const signupFormProps = useSignupForm(async () => {
    handleSignupClose(false);
    await refreshAuth();
  });

  // Forgot password state and handlers
  const forgotPassword = useForgotPassword();

  const handleForgotPasswordClick = () => {
    handleLoginClose(false);
    setForgotPasswordOpen(true);
    forgotPassword.setForgotPasswordEmail(loginForm.email);
  };

  const handleBackToLogin = () => {
    setForgotPasswordOpen(false);
    handleLoginClose(true);
  };

  const openSignup = () => {
    handleLoginClose(false);
    handleSignupClose(true);
  };

  const openLogin = () => {
    handleSignupClose(false);
    handleLoginClose(true);
  };

  // Guest checkout — no need to dispatch setGuestMode anymore.
  // Unauthenticated users are automatically treated as guests.
  const handleGuestCheckout = () => {
    handleLoginClose(false);
    router.push("/checkout");
  };

  // Auto-open login/signup modal if query param is present
  React.useEffect(() => {
    if (searchParams.get("login") === "true") {
      setLoginOpen(true);
    }
    if (searchParams.get("signup") === "true") {
      setSignupOpen(true);
    }
  }, [searchParams]);

  return (
    <div className="fixed top-2 left-2 space-x-2 z-50">
      <button
        className="flex gap-1 w-10 h-10 lg:w-24 lg:px-2 py-2 bg-yellow text-red hover:bg-black hover:text-yellow ring-2 ring-inset ring-black hover:ring-yellow rounded-lg font-Barlow font-bold text-sm inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:bg-opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95"
        onClick={() => setLoginOpen(true)}
      >
        <FontAwesomeIcon icon={faUser} />
        <span className="hidden lg:block">Giriş Yap</span>
      </button>

      <LoginDialog
        loginOpen={loginOpen}
        setLoginOpen={handleLoginClose}
        onGuestCheckout={handleGuestCheckout}
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
        setSignupOpen={handleSignupClose}
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

      <button
        className="flex gap-1 h-10 w-10 lg:w-20 lg:px-2 py-2 bg-white gap-1 text-red hover:bg-black hover:text-yellow ring-2 ring-inset ring-yellow hover:ring-white rounded-lg font-Barlow font-bold text-sm inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:bg-opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95"
        onClick={() => setSignupOpen(true)}
      >
        <FontAwesomeIcon icon={faUserPlus} />
        <span className="hidden lg:block">Üye Ol</span>
      </button>
    </div>
  );
};