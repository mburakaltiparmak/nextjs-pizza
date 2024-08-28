import { orderActions } from "../reducers/orderReducer"

export const setHamur = (hamur) => ({
    type: orderActions.setHamur,
    payload: hamur,
});

export const setBoyut = (boyut) => ({
    type: orderActions.setBoyut,
    payload: boyut,
});

export const setMalzemeler = (malzemeler) => ({
    type: orderActions.setMalzemeler,
    payload: malzemeler,
});

export const setSiparisNotu = (siparisNotu) => ({
    type: orderActions.setSiparisNotu,
    payload: siparisNotu,
});