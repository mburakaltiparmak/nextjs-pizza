"use client";
import React from "react";
import { useUserButton } from "@/hooks/use-user-button";
import { UserDropdown } from "./UserDropdown";
import { GuestButtons } from "./GuestButtons";
import Loading from "@/app/loading";
import useAuth from "@/hooks/use-auth";

const FloatingUserButton = () => {
  const { loading: authLoading } = useAuth([], "/", false);

  const {
    isLogin,
    userEmail,
    isClient,
    dropdownOpen,
    setDropdownOpen,
    isLoggingOut,
    dropdownRef,
    isAdminOrPersonal,
    displayName,
    handleLogout,
    handleNavigation,
    router,
  } = useUserButton();

  // SSR hydration fix: İlk render'da boş container döndür
  if (!isClient) {
    return <div className="relative"></div>;
  }

  // Auth loading state
  if (authLoading) {
    return <Loading />;
  }

  return (
    <div className="relative">
      {isLogin ? (
        <UserDropdown
          dropdownRef={dropdownRef}
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
          displayName={displayName}
          userEmail={userEmail}
          isAdminOrPersonal={isAdminOrPersonal}
          handleNavigation={handleNavigation}
          handleLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />
      ) : (
        <GuestButtons router={router} />
      )}
    </div>
  );
};

export default FloatingUserButton;