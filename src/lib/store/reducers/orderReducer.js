const initialState = {
  cart: [],
  userData: [],
  paymentData: [],
  orderData: null,
};

export const orderActions = {
  addCart: "ADD_CART",
  removeFromCart: "REMOVE_FROM_CART",
  updateCart: "UPDATE_CART",
  clearCart: "CLEAR_CART",
  setUserData: "SET_USER_DATA",
  setPaymentData: "SET_PAYMENT_DATA",
  setOrderData: "SET_ORDER_DATA",
};

export const orderReducer = (state = initialState, action) => {
  switch (action.type) {
    case orderActions.addCart:
      const existingItemIndex = state.cart.findIndex(
        (item) => item.product.product_id === action.payload.product.product_id
      );

      if (existingItemIndex !== -1) {
        return {
          ...state,
          cart: state.cart.map((item, index) =>
            index === existingItemIndex
              ? {
                  ...item,
                  count: item.count + 1,
                  product: action.payload.product,
                }
              : item
          ),
        };
      } else {
        return {
          ...state,
          cart: [...state.cart, { count: 1, product: action.payload.product }],
        };
      }
    case orderActions.removeFromCart:
      return {
        ...state,
        cart: state.cart.filter(
          (item) => item.product.product_id !== action.payload
        ),
      };
    case orderActions.updateCart: {
      const updatedCart = state.cart.map((item) =>
        item.product.product_id === action.payload.id
          ? { ...item, count: action.payload.newCount }
          : item
      );
      return {
        ...state,
        cart: updatedCart,
      };
    }
    case orderActions.clearCart:
      return {
        ...state,
        cart: [],
      };
    case orderActions.setUserData:
      return {
        ...state,
        userData: action.payload,
      };
    case orderActions.setPaymentData:
      return {
        ...state,
        paymentData: action.payload,
      };
    case orderActions.setOrderData:
      return {
        ...state,
        orderData: action.payload,
      };
    default:
      return state;
  }
};
