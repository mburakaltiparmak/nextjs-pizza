export const CART_STORAGE_KEY = 'cart';
const CART_BACKUP_KEY = 'cart_backup';
const CART_SYNC_KEY = 'cart_sync';
const CART_EXPIRY_DAYS = 7;

// Cart persistence utilities
export const cartStorage = {
    // Save cart to localStorage
    save: (cart) => {
        if (typeof window === 'undefined') return;
        try {
            const cartData = {
                items: cart, // Assuming 'cart' is the array of items
                timestamp: Date.now(),
                expiresAt: Date.now() + (CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
            };
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));

            // Trigger sync event for other tabs
            localStorage.setItem(CART_SYNC_KEY, Date.now().toString());

            return true;
        } catch (error) {
            console.error('Cart save error:', error);
            return false;
        }
    },

    // Load cart from localStorage
    load: () => {
        if (typeof window === 'undefined') return [];
        try {
            const cartDataStr = localStorage.getItem(CART_STORAGE_KEY);
            if (!cartDataStr) return [];

            const cartData = JSON.parse(cartDataStr);

            // Check expiry
            if (cartData.expiresAt && Date.now() > cartData.expiresAt) {
                cartStorage.clear();
                return [];
            }

            return cartData.items || [];
        } catch (error) {
            console.error('Cart load error:', error);
            return [];
        }
    },

    // Backup cart (before risky operations like payment or error handling)
    backup: () => {
        if (typeof window === 'undefined') return;
        try {
            const currentCart = localStorage.getItem(CART_STORAGE_KEY);
            if (currentCart) {
                localStorage.setItem(CART_BACKUP_KEY, currentCart);
                console.log('🛡️ Cart backed up');
            }
        } catch (error) {
            console.error('Cart backup error:', error);
        }
    },

    // Restore cart from backup
    restore: () => {
        if (typeof window === 'undefined') return [];
        try {
            const backupCart = localStorage.getItem(CART_BACKUP_KEY);
            if (backupCart) {
                localStorage.setItem(CART_STORAGE_KEY, backupCart);
                console.log('🔄 Cart restored from backup');
                return JSON.parse(backupCart).items || [];
            }
            return [];
        } catch (error) {
            console.error('Cart restore error:', error);
            return [];
        }
    },

    // Clear cart
    clear: () => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(CART_STORAGE_KEY);
            localStorage.removeItem(CART_BACKUP_KEY);
            // We might also want to notify other tabs to clear?
            // For now, simpler sync logic handles updates but maybe not explicit clear signal unless empty array is saved.
        } catch (error) {
            console.error('Cart clear error:', error);
        }
    },

    // Merge carts (for multi-tab sync)
    merge: (localCart, syncedCart) => {
        // If localCart is empty, just take synced
        if (!localCart || localCart.length === 0) return syncedCart;
        if (!syncedCart || syncedCart.length === 0) return localCart;

        const mergedMap = new Map();

        // Add local cart items
        localCart.forEach(item => {
            // Use unique identifier
            const key = item.id || item.productId; // Fallback if id is missing
            mergedMap.set(key, item);
        });

        // Merge synced cart items
        syncedCart.forEach(item => {
            const key = item.id || item.productId;
            if (mergedMap.has(key)) {
                // Conflict resolution: 
                // Strategy: Max quantity or Latest update?
                // Let's use max quantity to be safe against data loss
                const existing = mergedMap.get(key);
                if (item.count > existing.count) {
                    mergedMap.set(key, item);
                }
            } else {
                mergedMap.set(key, item);
            }
        });

        return Array.from(mergedMap.values());
    }
};
