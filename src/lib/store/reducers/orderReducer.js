
const initialState = {
    hamur : "",
    boyut : "",
    malzemeler : "",
    siparisNotu : "",
}
export const orderActions = {
    setHamur : "SET_HAMUR",
    setBoyut : "SET_BOYUT",
    setMalzemeler : "SET_MALZEMELER",
    setSiparisNotu : "SET_SIPARIS_NOTU",
};
export const orderReducer = (state=initialState,action) => {
    switch (action.type) {
        case orderActions.setHamur:
            return {
                ...state,
                hamur:action.payload,
            };
        case orderActions.setBoyut:
            return {
                ...state,
                boyut:action.payload,
            };
        case orderActions.setMalzemeler:
            return {
                ...state,
                malzemeler:action.payload,
            };
        case orderActions.setSiparisNotu:
            return {
                ...state,
                siparisNotu:action.payload,
            };
        default:
            return state;
    };
};