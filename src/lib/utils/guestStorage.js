const GUEST_INFO_KEY = 'guest_order_info';

export const saveGuestInfo = (guestInfo) => {
    if (typeof window === 'undefined') return;
    try {
        sessionStorage.setItem(GUEST_INFO_KEY, JSON.stringify(guestInfo));
        console.log('Guest info saved to sessionStorage');
    } catch (error) {
        console.error('Failed to save guest info:', error);
    }
};

export const loadGuestInfo = () => {
    if (typeof window === 'undefined') return null;
    try {
        const saved = sessionStorage.getItem(GUEST_INFO_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('Failed to load guest info:', error);
        return null;
    }
};

export const clearGuestInfo = () => {
    if (typeof window === 'undefined') return;
    try {
        sessionStorage.removeItem(GUEST_INFO_KEY);
        console.log('Guest info cleared from sessionStorage');
    } catch (error) {
        console.error('Failed to clear guest info:', error);
    }
};
