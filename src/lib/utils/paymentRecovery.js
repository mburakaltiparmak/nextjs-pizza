const PAYMENT_STATE_KEY = 'payment_state';

export const paymentRecovery = {
    // Save payment state before 3D Secure redirect
    saveState: (orderId, paymentId, amount, uuid) => {
        if (typeof window === 'undefined') return;
        const state = {
            orderId,
            paymentId,
            uuid,
            amount,
            timestamp: Date.now(),
            status: 'PENDING'
        };
        localStorage.setItem(PAYMENT_STATE_KEY, JSON.stringify(state));
    },

    // Load payment state after redirect
    loadState: () => {
        if (typeof window === 'undefined') return null;
        try {
            const stateStr = localStorage.getItem(PAYMENT_STATE_KEY);
            if (!stateStr) return null;
            return JSON.parse(stateStr);
        } catch (error) {
            return null;
        }
    },

    // Clear payment state
    clearState: () => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(PAYMENT_STATE_KEY);
    },

    // Check for incomplete payment on app load
    checkIncompletePayment: async (apiInstance) => {
        const state = paymentRecovery.loadState();
        if (!state) return null;

        // Payment state exists - check if it was completed
        const timeDiff = Date.now() - state.timestamp;
        const TIMEOUT = 15 * 60 * 1000; // 15 minutes timeout

        if (timeDiff > TIMEOUT) {
            // Too old - clear it
            paymentRecovery.clearState();
            return { type: 'TIMEOUT' };
        }

        try {
            // Check payment status from backend
            // Per updates.txt, we must use UUID for status check to prevent enumeration
            const response = await apiInstance.get(`/payment/${state.uuid}/status`);

            if (response.data.status === 'SUCCESS') {
                // Payment completed - redirect to success
                return {
                    type: 'SUCCESS',
                    orderId: state.orderId,
                    paymentId: state.paymentId
                };
            } else if (response.data.status === 'FAILED') {
                // Payment failed - show error
                paymentRecovery.clearState();
                return {
                    type: 'FAILED',
                    error: response.data.errorMessage || "Ödeme başarısız oldu"
                };
            } else {
                // Still pending or unknown
                return {
                    type: 'PENDING',
                    paymentId: state.paymentId
                };
            }
        } catch (error) {
            console.error('Payment recovery check error:', error);
            // Backend might return 404 if paymentId is invalid or process failed early
            if (error.response?.status === 404) {
                paymentRecovery.clearState();
                return { type: 'FAILED', error: "Ödeme kaydı bulunamadı" };
            }
            return null;
        }
    }
};
