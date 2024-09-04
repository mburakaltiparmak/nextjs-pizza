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

export const setSiparisNotu = (index, note) => ({
    type: orderActions.setSiparisNotu,
    payload: { index, note },
});

export const addCart = (product) => ({
    type: orderActions.addCart,
    payload: { product },
});

export const removeFromCart = (index) => ({
    type: orderActions.removeFromCart,
    payload: index,
});

export const updateCart = (index, updatedItem) => ({
    type: orderActions.updateCart,
    payload: { index, updatedItem },
});

export const clearCart = () => ({
    type: orderActions.clearCart,
});

export const setCustomPizza = (customPizza) => ({
    type: orderActions.setCustomPizza,
    payload: customPizza,
});

export const setPrice = (price) => ({
    type: orderActions.setPrice,
    payload: price,
});

export const setCount = (index, count) => ({
    type: orderActions.setCount,
    payload: { index, count },
});