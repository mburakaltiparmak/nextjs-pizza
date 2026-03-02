// src/lib/store/reducers/appReducer.js
import { appActions } from "../actions/appActions";

const GUEST_MODE_KEY = 'app_is_guest_mode';

const getInitialGuestMode = () => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(GUEST_MODE_KEY) === 'true';
};

const initialState = {
    isGuestMode: getInitialGuestMode(),
    isLoading: false,
};

const appReducer = (state = initialState, action) => {
    switch (action.type) {
        case appActions.SET_GUEST_MODE:
            if (typeof window !== 'undefined') {
                sessionStorage.setItem(GUEST_MODE_KEY, String(action.payload));
            }
            return {
                ...state,
                isGuestMode: action.payload,
            };

        case appActions.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload,
            };

        case appActions.RESET_APP_STATE:
            return initialState;

        default:
            return state;
    }
};

export default appReducer;
