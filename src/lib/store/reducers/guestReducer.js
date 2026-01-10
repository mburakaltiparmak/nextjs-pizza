import { saveGuestInfo, loadGuestInfo, clearGuestInfo } from '@/lib/utils/guestStorage';

// Load from localStorage on init
const savedGuestInfo = loadGuestInfo();
const initialState = savedGuestInfo || {
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    address: null // Adres bilgilerini tutacak
};

// Save to localStorage on every update
export const setGuestInfo = (info) => {
    return {
        type: guestActions.SET_GUEST_INFO,
        payload: info,
    };
};

// Clear from localStorage on logout
export const clearGuestData = () => {
    return {
        type: guestActions.CLEAR_GUEST_DATA,
    };
};

export const guestActions = {
    SET_GUEST_NAME: "SET_GUEST_NAME",
    SET_GUEST_SURNAME: "SET_GUEST_SURNAME",
    SET_GUEST_EMAIL: "SET_GUEST_EMAIL",
    SET_GUEST_PHONE: "SET_GUEST_PHONE",
    SET_GUEST_ADDRESS: "SET_GUEST_ADDRESS",
    CLEAR_GUEST_DATA: "CLEAR_GUEST_DATA",
    SET_GUEST_INFO: "SET_GUEST_INFO"
};

export const guestReducer = (state = initialState, action) => {
    switch (action.type) {
        case guestActions.SET_GUEST_NAME:
            return {
                ...state,
                name: action.payload,
            };
        case guestActions.SET_GUEST_SURNAME:
            return {
                ...state,
                surname: action.payload,
            };
        case guestActions.SET_GUEST_EMAIL:
            return {
                ...state,
                email: action.payload,
            };
        case guestActions.SET_GUEST_PHONE:
            return {
                ...state,
                phoneNumber: action.payload,
            };
        case guestActions.SET_GUEST_ADDRESS:
            return {
                ...state,
                address: action.payload,
            };
        case guestActions.SET_GUEST_INFO:
            saveGuestInfo(action.payload);
            return action.payload;
        case guestActions.CLEAR_GUEST_DATA:
            clearGuestInfo();
            return {
                name: "",
                surname: "",
                email: "",
                phoneNumber: "",
                address: null
            };
        default:
            return state;
    }
};