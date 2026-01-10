// src/lib/store/reducers/appReducer.js
import { appActions } from "../actions/appActions";

const initialState = {
    isGuestMode: false,
    isLoading: false,
};

const appReducer = (state = initialState, action) => {
    switch (action.type) {
        case appActions.SET_GUEST_MODE:
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
