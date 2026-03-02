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
    let newState;
    switch (action.type) {
        case guestActions.SET_GUEST_NAME:
            newState = { ...state, name: action.payload };
            saveGuestInfo(newState);
            return newState;
        case guestActions.SET_GUEST_SURNAME:
            newState = { ...state, surname: action.payload };
            saveGuestInfo(newState);
            return newState;
        case guestActions.SET_GUEST_EMAIL:
            newState = { ...state, email: action.payload };
            saveGuestInfo(newState);
            return newState;
        case guestActions.SET_GUEST_PHONE:
            newState = { ...state, phoneNumber: action.payload };
            saveGuestInfo(newState);
            return newState;
        case guestActions.SET_GUEST_ADDRESS:
            newState = { ...state, address: action.payload };
            saveGuestInfo(newState);
            return newState;
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