const initialState = {
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    address: null // Adres bilgilerini tutacak
};

export const guestActions = {
    SET_GUEST_NAME: "SET_GUEST_NAME",
    SET_GUEST_SURNAME: "SET_GUEST_SURNAME",
    SET_GUEST_EMAIL: "SET_GUEST_EMAIL",
    SET_GUEST_PHONE: "SET_GUEST_PHONE",
    SET_GUEST_ADDRESS: "SET_GUEST_ADDRESS",
    CLEAR_GUEST_DATA: "CLEAR_GUEST_DATA"
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
        case guestActions.CLEAR_GUEST_DATA:
            return initialState;
        default:
            return state;
    }
};