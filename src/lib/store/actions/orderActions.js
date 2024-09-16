import { useAppSelector, useAppDispatch, useAppStore } from "@/lib/hooks";
import { orderActions } from "../reducers/orderReducer";
import { useToast } from "@/hooks/use-toast";

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

export const setUserData = (userData) => ({
  type: orderActions.setUserData,
  payload: userData,
});

export const setPaymentData = (paymentData) => ({
  type: orderActions.setPaymentData,
  payload: paymentData,
});

export const setOrderData = (orderData) => ({
  type: orderActions.setOrderData,
  payload: orderData,
});

