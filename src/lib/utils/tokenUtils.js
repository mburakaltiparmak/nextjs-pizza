import { jwtDecode } from "jwt-decode";

export const decodeToken = (token) => {
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error('Token decode error:', error);
        return null;
    }
};

export const getTokenExpiration = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return null;
    return decoded.exp * 1000; // Convert to milliseconds
};

export const isTokenExpired = (token) => {
    const expiration = getTokenExpiration(token);
    if (!expiration) return true;
    return Date.now() >= expiration;
};

export const getTimeUntilExpiration = (token) => {
    const expiration = getTokenExpiration(token);
    if (!expiration) return 0;
    return expiration - Date.now();
};

export const shouldRefreshToken = (token, bufferTimeMs = 120000) => {
    // Refresh if less than 2 minutes (120000ms) remaining
    const timeLeft = getTimeUntilExpiration(token);
    return timeLeft > 0 && timeLeft < bufferTimeMs;
};
