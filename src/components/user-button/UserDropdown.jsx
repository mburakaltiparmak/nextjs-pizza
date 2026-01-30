"use client";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faSignOutAlt,
  faUserEdit,
  faShoppingBag,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";

export const UserDropdown = ({
  dropdownRef,
  dropdownOpen,
  setDropdownOpen,
  displayName,
  userEmail,
  isAdminOrPersonal,
  handleNavigation,
  handleLogout,
  isLoggingOut,
}) => {
  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="bg-yellow z-100 p-3 max-md:fixed max-md:top-2 max-md:text-xs max-md:gap-1 font-Londrina_Solid text-red ring-2 ring-inset ring-black rounded-lg shadow-lg hover:bg-black hover:ring-yellow hover:text-yellow transition-all duration-200 cursor-pointer flex items-center gap-2 text-base font-normal"
      >
        <FontAwesomeIcon icon={faUser} />
      </div>

      {dropdownOpen && (
        <div className="fixed left-4 mt-2 max-md:mt-8 max-md:text-sm w-56 bg-white rounded-md shadow-lg overflow-hidden z-50 font-Barlow">
          {/* User Info Header */}
          <div className="py-2 border-b border-red">
            <div className="px-4 py-2">
              <div className="font-bold truncate font-Londrina_Solid text-red max-md:text-lg">
                {displayName}
              </div>
              <div className="text-gray-600 text-xs truncate">{userEmail}</div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <div
              className="px-4 py-2 hover:bg-lightgray cursor-pointer flex items-center text-darkgray text-sm max-md:text-xs"
              onClick={() => handleNavigation("/profile")}
            >
              <FontAwesomeIcon icon={faUserEdit} className="mr-2" />
              <span>Profil Bilgilerim</span>
            </div>

            {isAdminOrPersonal ? (
              <div
                className="px-4 py-2 hover:bg-lightgray cursor-pointer flex items-center text-darkgray text-sm max-md:text-xs"
                onClick={() => handleNavigation("/dashboard")}
              >
                <FontAwesomeIcon icon={faUserTie} className="mr-2" />
                <span>Admin Panel</span>
              </div>
            ) : (
              <div
                className="px-4 py-2 hover:bg-lightgray cursor-pointer flex items-center text-darkgray text-sm max-md:text-xs"
                onClick={() => handleNavigation("/orders")}
              >
                <FontAwesomeIcon icon={faShoppingBag} className="mr-2" />
                <span>Siparişlerim</span>
              </div>
            )}
          </div>

          {/* Logout */}
          <div className="py-1 border-t border-red">
            <div
              className={`px-4 py-2 hover:bg-lightgray cursor-pointer flex items-center text-red text-sm max-md:text-xs ${isLoggingOut ? "opacity-70 cursor-not-allowed" : ""
                }`}
              onClick={!isLoggingOut ? handleLogout : undefined}
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
              <span>{isLoggingOut ? "Çıkış Yapılıyor..." : "Çıkış Yap"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};