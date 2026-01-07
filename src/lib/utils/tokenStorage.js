/**
 * Standardized Token Storage Utility
 * 
 * ONLY uses accessToken and refreshToken format
 * Centralizes "Remember Me" logic
 */

export const getStorage = () => {
    if (typeof window === 'undefined') return null;
    const rememberMe = localStorage.getItem("rememberMe") === "true";
    return rememberMe ? localStorage : sessionStorage;
};

export const getRememberMe = () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem("rememberMe") === "true";
};

export const setRememberMe = (remember) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem("rememberMe", remember ? "true" : "false");
};

export const setTokens = (accessToken, refreshToken, email, rememberMe = false) => {
    if (typeof window === 'undefined') return;

    const storage = rememberMe ? localStorage : sessionStorage;

    // Clear potential old tokens from other storage
    const otherStorage = rememberMe ? sessionStorage : localStorage;
    otherStorage.removeItem("accessToken");
    otherStorage.removeItem("refreshToken");
    otherStorage.removeItem("userEmail");

    storage.setItem("accessToken", accessToken);
    if (refreshToken) storage.setItem("refreshToken", refreshToken);
    if (email) storage.setItem("userEmail", email);

    localStorage.setItem("rememberMe", rememberMe ? "true" : "false");

    console.log('Tokens stored successfully');
};

export const getAccessToken = () => {
    const storage = getStorage();
    return storage ? storage.getItem("accessToken") : null;
};

export const getRefreshToken = () => {
    const storage = getStorage();
    return storage ? storage.getItem("refreshToken") : null;
};

export const getUserEmail = () => {
    const storage = getStorage();
    return storage ? storage.getItem("userEmail") : null;
};

export const clearTokens = () => {
    if (typeof window === 'undefined') return;

    // Clear from both storages to be safe
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("token"); // Legacy

    // Clear Supabase token if exists
    localStorage.removeItem("sb-nslkxjzddnjpouzkevii-auth-token");

    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("token"); // Legacy

    // Keep rememberMe preference but set to false default (or keep as is? Guide says set to false)
    // Let's set to false to be safe as per guide
    localStorage.setItem("rememberMe", "false");

    console.log('Tokens cleared');
};
