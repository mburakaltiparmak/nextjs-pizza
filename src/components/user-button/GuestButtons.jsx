"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { LoginDialog } from "./LoginDialog";
import { SignupDialog } from "./SignupDialog";
import { ForgotPasswordDialog } from "./ForgotPasswordDialog";
import { useLoginForm } from "@/lib/hooks/useLoginForm";
import { useSignupForm } from "@/lib/hooks/useSignupForm";
import { useForgotPassword } from "@/lib/hooks/useForgotPassword";
import useAuth from "@/lib/hooks/useAuth";
import { useAppDispatch } from "@/lib/hooks";
import { setGuestMode } from "@/lib/store/actions/appActions";

export const GuestButtons = ({ router }) => {
  const searchParams = useSearchParams();
  const { loading: authLoading, refreshAuth } = useAuth([], "/", false);
  const dispatch = useAppDispatch();

  const [loginOpen, setLoginOpen] = React.useState(false);
  const [signupOpen, setSignupOpen] = React.useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = React.useState(false);

  // Login form state and handlers
  const loginForm = useLoginForm(async () => {
    setLoginOpen(false);
    await refreshAuth();
  });

  // Signup form state and handlers
  const signupFormProps = useSignupForm(async () => {
    setSignupOpen(false);
    await refreshAuth();
  });

  // Forgot password state and handlers
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

  const handleGuestCheckout = () => {
    dispatch(setGuestMode(true));
    setLoginOpen(false);
    router.push("/create-order");
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
    <div className="flex gap-2 items-center max-md:items-start max-md:flex-col max-md:fixed max-md:right-4 max-md:top-2 max-md:z-50">
      <LoginDialog
        loginOpen={loginOpen}
        setLoginOpen={setLoginOpen}
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

      <button
        className="h-10 max-md:w-16 max-md:text-xs max-md:h-8 px-4 py-2 bg-white gap-1 text-red hover:bg-black hover:text-yellow ring-2 ring-inset ring-yellow hover:ring-white rounded-lg font-Barlow font-bold text-sm inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:bg-opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95"
        onClick={() => setSignupOpen(true)}
      >
        <FontAwesomeIcon icon={faUserPlus} className="mr-2 max-md:mr-0" />
        <span className="max-md:hidden">Üye Ol</span>
      </button>
    </div>
  );
};