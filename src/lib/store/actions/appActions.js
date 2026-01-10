// src/lib/store/actions/appActions.js

export const appActions = {
    SET_GUEST_MODE: "SET_GUEST_MODE",
    SET_LOADING: "SET_APP_LOADING",
    RESET_APP_STATE: "RESET_APP_STATE"
};

export const setGuestMode = (isGuest) => ({
    type: appActions.SET_GUEST_MODE,
    payload: isGuest,
});

export const setAppLoading = (isLoading) => ({
    type: appActions.SET_LOADING,
    payload: isLoading,
});

export const resetAppState = () => ({
    type: appActions.RESET_APP_STATE,
});
