"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser,
    faUserPlus,
    faSignOutAlt,
    faUserEdit,
    faShoppingBag,
    faUserTie,
    faBars,
    faHome,
    faTimes,
    faUtensils,
} from "@fortawesome/free-solid-svg-icons";
import { useUserButton } from "@/lib/hooks/useUserButton";
import { LoginDialog } from "../user-button/LoginDialog";
import { SignupDialog } from "../user-button/SignupDialog";
import { ForgotPasswordDialog } from "../user-button/ForgotPasswordDialog";
import { useLoginForm } from "@/lib/hooks/useLoginForm";
import { useSignupForm } from "@/lib/hooks/useSignupForm";
import { useForgotPassword } from "@/lib/hooks/useForgotPassword";
import useAuth from "@/lib/hooks/useAuth";
import { useAppDispatch } from "@/lib/hooks";
import { setGuestMode } from "@/lib/store/actions/appActions";
import Link from "next/link";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { useRouter, usePathname } from "next/navigation";

const Sidebar = () => {
    const { loading: authLoading, refreshAuth } = useAuth([], "/", false);
    const dispatch = useAppDispatch();
    const [isOpen, setIsOpen] = useState(false);

    // User Hook (reuses existing logic)
    const {
        isLogin,
        displayName,
        isAdminOrPersonal,
        handleLogout,
        handleNavigation,
        router,
        isLoggingOut,
    } = useUserButton();

    // Dialog States
    const [isHomePage, setIsHomePage] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [signupOpen, setSignupOpen] = useState(false);
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

    const pathname = usePathname();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Anasayfa kontrolü (Root, /tr veya /en)
        const isHome = pathname === "/" || pathname === "/tr" || pathname === "/en";
        setIsHomePage(isHome);
    }, [pathname]);

    // Forms
    const loginForm = useLoginForm(async () => {
        setLoginOpen(false);
        await refreshAuth();
    });

    const signupFormProps = useSignupForm(async () => {
        setSignupOpen(false);
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

    const handleGuestCheckout = () => {
        dispatch(setGuestMode(true));
        setLoginOpen(false);
        router.push("/checkout");
    };

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Toggle Button (Visible when closed) */}
            {!isOpen && (
                <button
                    onClick={toggleSidebar}
                    className="fixed left-4 top-4 z-50 p-3 bg-yellow text-red flex items-center justify-center shadow-lg hover:bg-darkred hover:text-yellow transition-all duration-300 ring-2 ring-white"
                    aria-label="Menüyü Aç"
                >
                    <FontAwesomeIcon icon={faBars} className="text-xl" />
                </button>
            )}

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Drawer */}
            <aside
                className={`fixed left-0 top-0 h-full w-72 bg-red text-white z-50 flex flex-col shadow-2xl border-r-4 border-yellow/50 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/20">
                    <span className="font-Londrina_Solid text-3xl text-yellow tracking-wide">Menü</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-white/80 hover:text-white hover:scale-110 transition-transform"
                        aria-label="Menüyü Kapat"
                    >
                        <FontAwesomeIcon icon={faTimes} className="text-2xl" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto py-6 px-4 flex flex-col gap-3">
                    {isHomePage ? "" : (
                        <div>
                            <Link
                                href="/"
                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/20 transition-all text-white group"
                                onClick={() => setIsOpen(false)}
                            >
                                <div className="w-10 h-10 bg-yellow text-red rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                                    <FontAwesomeIcon icon={faHome} className="text-lg" />
                                </div>
                                <span className="font-Barlow font-semibold text-lg">Anasayfa</span>
                            </Link>
                            <div className="h-px bg-white/20 my-2 mx-2"></div>
                        </div>
                    )}
                    {
                        authLoading ? (
                            <div className="flex justify-center py-4" >
                                <LoadingSpinner size="small" color="border-white" />
                            </div >
                        ) : (mounted && isLogin) ? (
                            // USER LINKS
                            <>
                                {/* User Profile Summary */}
                                <div className="flex items-center gap-4 p-3 mb-2 bg-black/20 rounded-xl border border-yellow/30">
                                    <div className="w-12 h-12 bg-white text-red rounded-full flex items-center justify-center font-bold font-Barlow text-xl border-2 border-yellow shadow-sm" title={displayName}>
                                        {displayName ? displayName.charAt(0).toUpperCase() : <FontAwesomeIcon icon={faUser} />}
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="font-Barlow font-bold text-yellow truncate">Merhaba,</span>
                                        <span className="font-Barlow text-sm truncate opacity-90">{displayName || "Kullanıcı"}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        handleNavigation("/profile");
                                        setIsOpen(false);
                                    }}
                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/20 transition-all text-white group text-left"
                                >
                                    <div className="w-10 h-10 flex items-center justify-center">
                                        <FontAwesomeIcon icon={faUserEdit} className="text-xl group-hover:text-yellow transition-colors" />
                                    </div>
                                    <span className="font-Barlow font-medium text-lg">Profil Bilgilerim</span>
                                </button>

                                {isAdminOrPersonal ? (
                                    <button
                                        onClick={() => {
                                            handleNavigation("/dashboard");
                                            setIsOpen(false);
                                        }}
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/20 transition-all text-white group text-left"
                                    >
                                        <div className="w-10 h-10 flex items-center justify-center">
                                            <FontAwesomeIcon icon={faUserTie} className="text-xl group-hover:text-yellow transition-colors" />
                                        </div>
                                        <span className="font-Barlow font-medium text-lg">Admin Paneli</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            handleNavigation("/orders");
                                            setIsOpen(false);
                                        }}
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/20 transition-all text-white group text-left"
                                    >
                                        <div className="w-10 h-10 flex items-center justify-center">
                                            <FontAwesomeIcon icon={faShoppingBag} className="text-xl group-hover:text-yellow transition-colors" />
                                        </div>
                                        <span className="font-Barlow font-medium text-lg">Siparişlerim</span>
                                    </button>
                                )}
                            </>
                        ) : (
                            // GUEST LINKS
                            <>


                                <button
                                    onClick={() => setLoginOpen(true)}
                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/20 transition-all text-white group text-left bg-black/20"
                                >
                                    <div className="w-10 h-10 bg-yellow text-red rounded-full flex items-center justify-center shadow-md">
                                        <FontAwesomeIcon icon={faUser} className="text-lg" />
                                    </div>
                                    <span className="font-Barlow font-bold text-lg">Giriş Yap</span>
                                </button>

                                <button
                                    onClick={() => setSignupOpen(true)}
                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/20 transition-all text-white group text-left border border-white/20"
                                >
                                    <div className="w-10 h-10 bg-white text-red rounded-full flex items-center justify-center shadow-md">
                                        <FontAwesomeIcon icon={faUserPlus} className="text-lg" />
                                    </div>
                                    <span className="font-Barlow font-bold text-lg">Üye Ol</span>
                                </button>
                            </>
                        )}
                </div >

                {/* Footer / Logout */}
                {
                    (mounted && isLogin) && (
                        <div className="p-6 border-t border-white/20">
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsOpen(false);
                                }}
                                disabled={isLoggingOut}
                                className="w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-darkred hover:bg-black transition-colors text-white shadow-lg"
                            >
                                <FontAwesomeIcon icon={faSignOutAlt} />
                                <span className="font-Barlow font-bold">Güvenli Çıkış</span>
                            </button>
                        </div>
                    )
                }
            </aside >

            {/* Dialogs */}
            < LoginDialog
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
        </>
    );
};

export default Sidebar;
