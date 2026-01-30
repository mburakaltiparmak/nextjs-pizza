import { createSelector } from 'reselect';

// Base order state
const selectOrderState = (state) => state.order;

// Memoized Selectors
export const selectCart = createSelector(
    [selectOrderState],
    (order) => order.cart
);

export const selectCartItems = selectCart; // Alias for cart

export const selectCartItemCount = createSelector(
    [selectCart],
    (cart) => cart.reduce((total, item) => total + item.count, 0)
);

export const selectCartTotal = createSelector(
    [selectCart],
    (cart) => cart.reduce((total, item) => total + (item.product.price * item.count), 0)
);

export const selectOrderUserData = createSelector(
    [selectOrderState],
    (order) => order.userData
);

export const selectSelectedAddress = createSelector(
    [selectOrderState],
    (order) => order.selectedAddress
);

export const selectPaymentMethod = createSelector(
    [selectOrderState],
    (order) => order.paymentMethod
);

export const selectOrderDetail = createSelector(
    [selectOrderState],
    (order) => order.orderDetail
);

export const selectOrderFetchState = createSelector(
    [selectOrderState],
    (order) => order.fetchState
);

export const selectOrderError = createSelector(
    [selectOrderState],
    (order) => order.error
);

export const selectUserOrders = createSelector(
    [selectOrderState],
    (order) => order.orders || []
);
