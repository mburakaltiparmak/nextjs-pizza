const GUEST_INFO_KEY = 'guest_order_info';

export const saveGuestInfo = (guestInfo) => {
    try {
        localStorage.setItem(GUEST_INFO_KEY, JSON.stringify(guestInfo));
        console.log('Guest info saved to localStorage');
    } catch (error) {
        console.error('Failed to save guest info:', error);
    }
};

export const loadGuestInfo = () => {
    try {
        const saved = localStorage.getItem(GUEST_INFO_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('Failed to load guest info:', error);
        return null;
    }
};

export const clearGuestInfo = () => {
    try {
        localStorage.removeItem(GUEST_INFO_KEY);
        console.log('Guest info cleared from localStorage');
    } catch (error) {
        console.error('Failed to clear guest info:', error);
    }
};
