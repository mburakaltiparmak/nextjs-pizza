
import axios from 'axios';
import { setTokens, getUserEmail, getRememberMe, clearTokens } from './tokenStorage';

class TokenRefreshManager {
    constructor() {
        this.isRefreshing = false;
        this.refreshPromise = null;
    }

    async refreshToken(refreshToken, apiBaseUrl) {
        // If already refreshing, return the existing promise
        if (this.isRefreshing && this.refreshPromise) {
            console.log('Token refresh already in progress, waiting...');
            return this.refreshPromise;
        }

        // Mark as refreshing and create new promise
        this.isRefreshing = true;

        this.refreshPromise = (async () => {
            try {
                console.log('Refreshing token...');

                const response = await axios.post(
                    `${apiBaseUrl}/auth/refresh-token`,
                    { refreshToken },
                    { headers: { 'Content-Type': 'application/json' } }
                );

                const { accessToken } = response.data;

                // Store new token
                setTokens(
                    accessToken,
                    refreshToken, // Typically reuse existing unless rotated
                    getUserEmail(),
                    getRememberMe()
                );

                console.log('Token refreshed successfully');

                return accessToken;
            } catch (error) {
                console.error('Token refresh failed:', error);

                // Clear storage on refresh failure
                clearTokens();

                throw error;
            } finally {
                // Reset state
                this.isRefreshing = false;
                this.refreshPromise = null;
            }
        })();

        return this.refreshPromise;
    }

    reset() {
        this.isRefreshing = false;
        this.refreshPromise = null;
    }
}

// Singleton instance
export const tokenRefreshManager = new TokenRefreshManager();
