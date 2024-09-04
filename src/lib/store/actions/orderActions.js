import { orderActions } from "../reducers/orderReducer";

export const addCart = (product) => ({
  type: orderActions.addCart,
  payload: { product },
});

export const removeFromCart = (index) => ({
  type: orderActions.removeFromCart,
  payload: index,
});

export const updateCart = (id, newCount) => ({
  type: orderActions.updateCart,
  payload: { id, newCount },
});

export const clearCart = () => ({
  type: orderActions.clearCart,
});
