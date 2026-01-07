import { store } from '@/lib/store/store';
import { shouldRefreshToken, isTokenExpired, getTokenExpiration } from './tokenUtils';
import { instance } from '@/lib/hooks'; // We will address duplicate instances later
import { setToken, setTokenExpiration, logout } from '@/lib/store/actions/userActions';
import { getRefreshToken, setTokens, getUserEmail, getRememberMe } from './tokenStorage';

let refreshInterval = null;

export const startTokenRefreshMonitor = () => {
    // Clear any existing interval
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }

    // Check every 30 seconds
    refreshInterval = setInterval(async () => {
        const state = store.getState();
        const { token } = state.user;

        if (!token) {
            stopTokenRefreshMonitor();
            return;
        }

        // Check if expired
        if (isTokenExpired(token)) {
            console.log('Token expired, attempting refresh...');
            await attemptTokenRefresh();
            return;
        }

        // Check if should refresh (within 2 minutes of expiration)
        if (shouldRefreshToken(token)) {
            console.log('Token expiring soon, proactively refreshing...');
            await attemptTokenRefresh();
        }
    }, 30000); // Check every 30 seconds
};

export const stopTokenRefreshMonitor = () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
};

const attemptTokenRefresh = async () => {
    try {
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
            console.error('No refresh token available');
            store.dispatch(logout());
            return;
        }

        const response = await instance.post('/auth/refresh-token', { refreshToken });
        const { accessToken } = response.data;

        // Update token in storage (using safe fallback for email)
        setTokens(
            accessToken,
            refreshToken, // Reuse existing refresh token unless backend returns new one (usually backend rotates it)
            getUserEmail(),
            getRememberMe()
        );

        // Update axios header directly here or rely on interceptor (interceptor is better but safe to set)
        instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        // Dispatch new token to Redux
        store.dispatch(setToken(accessToken));

        // Update expiration info
        const expiresAt = getTokenExpiration(accessToken);
        const expiresIn = expiresAt ? Math.floor((expiresAt - Date.now()) / 1000) : null;
        store.dispatch(setTokenExpiration(expiresAt, expiresIn));

        console.log('Token refreshed successfully');
    } catch (error) {
        console.error('Token refresh failed:', error);
        store.dispatch(logout());
    }
};
