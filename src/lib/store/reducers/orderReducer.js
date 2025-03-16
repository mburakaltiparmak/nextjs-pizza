import { fetchStates } from "../constants";

export const orderActions = {
  ADD_TO_CART: "ADD_TO_CART",
  REMOVE_FROM_CART: "REMOVE_FROM_CART",
  UPDATE_CART_ITEM: "UPDATE_CART_ITEM",
  CLEAR_CART: "CLEAR_CART",
  SET_USER_ORDERS: "SET_USER_ORDERS",
  SET_ORDER_DETAIL: "SET_ORDER_DETAIL",
  SET_FETCH_STATE: "SET_ORDER_FETCH_STATE",
  SET_ERROR: "SET_ORDER_ERROR"
};

const orderInitialState = {
  cart: [],
  userOrders: [], // Kullanıcının geçmiş siparişleri
  orderDetail: null, // Sipariş detayı
  fetchState: fetchStates.NOT_FETCHED,
  error: null
};

export const orderReducer = (state = orderInitialState, action) => {
  switch (action.type) {
    case orderActions.ADD_TO_CART:
      // Eğer ürün zaten sepette varsa miktarını artır
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item => 
            item.id === action.payload.id 
              ? { ...item, quantity: item.quantity + action.payload.quantity } 
              : item
          )
        };
      }
      // Ürün sepette yoksa yeni ekle
      return {
        ...state,
        cart: [...state.cart, action.payload]
      };
    case orderActions.REMOVE_FROM_CART:
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload)
      };
    case orderActions.UPDATE_CART_ITEM:
      return {
        ...state,
        cart: state.cart.map(item => 
          item.id === action.payload.id 
            ? { ...item, quantity: action.payload.quantity } 
            : item
        )
      };
    case orderActions.CLEAR_CART:
      return {
        ...state,
        cart: []
      };
    case orderActions.SET_USER_ORDERS:
      return {
        ...state,
        userOrders: action.payload
      };
    case orderActions.SET_ORDER_DETAIL:
      return {
        ...state,
        orderDetail: action.payload
      };
    case orderActions.SET_FETCH_STATE:
      return {
        ...state,
        fetchState: action.payload
      };
    case orderActions.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };
    default:
      return state;
  }
};