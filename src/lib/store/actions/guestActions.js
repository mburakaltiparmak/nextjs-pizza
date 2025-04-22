import { guestActions } from "../reducers/guestReducer";

export const setGuestName = (name) => ({
    type: guestActions.SET_GUEST_NAME,
    payload: name,
});

export const setGuestSurname = (surname) => ({
    type: guestActions.SET_GUEST_SURNAME,
    payload: surname,
});

export const setGuestEmail = (email) => ({
    type: guestActions.SET_GUEST_EMAIL,
    payload: email,
});

export const setGuestPhone = (phoneNumber) => ({
    type: guestActions.SET_GUEST_PHONE,
    payload: phoneNumber,
});

export const setGuestAddress = (address) => ({
    type: guestActions.SET_GUEST_ADDRESS,
    payload: address,
});

export const clearGuestData = () => ({
    type: guestActions.CLEAR_GUEST_DATA,
});