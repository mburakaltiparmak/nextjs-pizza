import { fetchStates } from "../constants";
import { orderActions } from "../actions/orderActions";

const orderInitialState = {
  cart: [],
  userOrders: [], // Kullanıcının geçmiş siparişleri
  orderDetail: null, // Sipariş detayı
  userData: null, // Kullanıcı adresi ve teslimat bilgileri
  paymentData: null, // Ödeme bilgileri
  paymentMethod: "CREDIT_CARD", // Varsayılan ödeme yöntemi
  selectedAddress: null, // Seçilen veya oluşturulan adres bilgisi
  fetchState: fetchStates.NOT_FETCHED,
  error: null,
};

export const orderReducer = (state = orderInitialState, action) => {
  switch (action.type) {
    case orderActions.ADD_TO_CART:
      // Eğer ürün zaten sepette varsa count'u artır
      const existingItemIndex = state.cart.findIndex(
        (item) => item.id === action.payload.id
      );

      if (existingItemIndex !== -1) {
        const updatedCart = [...state.cart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          count: updatedCart[existingItemIndex].count + action.payload.count,
        };

        return {
          ...state,
          cart: updatedCart,
        };
      }

      // Ürün sepette yoksa yeni ekle
      return {
        ...state,
        cart: [...state.cart, action.payload],
      };

    case orderActions.REMOVE_FROM_CART:
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
      };

    case orderActions.UPDATE_CART_ITEM:
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload.id
            ? { ...item, count: action.payload.quantity }
            : item
        ),
      };

    case orderActions.CLEAR_CART:
      return {
        ...state,
        cart: [],
      };

    case orderActions.LOAD_CART_FROM_STORAGE:
      return {
        ...state,
        cart: action.payload,
      };

    case orderActions.SET_USER_ORDERS:
      return {
        ...state,
        userOrders: action.payload,
      };

    case orderActions.SET_ORDER_DETAIL:
      return {
        ...state,
        orderDetail: action.payload,
      };

    case orderActions.SET_FETCH_STATE:
      return {
        ...state,
        fetchState: action.payload,
      };

    case orderActions.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case orderActions.SET_USER_DATA:
      // Kullanıcı verileri ayarlanırken, adres de varsa seçili adres olarak güncelle
      const newUserData = action.payload;
      let selectedAddress = state.selectedAddress;

      // Var olan adres veya yeni adres bilgisi varsa seçilen adres olarak güncelle
      if (newUserData.userAddress) {
        selectedAddress = newUserData.userAddress;
      } else if (newUserData.newAddress) {
        selectedAddress = newUserData.newAddress;
      }

      return {
        ...state,
        userData: newUserData,
        selectedAddress: selectedAddress,
      };

    case orderActions.SET_PAYMENT_DATA:
      return {
        ...state,
        paymentData: action.payload,
      };

    case orderActions.SET_PAYMENT_METHOD:
      return {
        ...state,
        paymentMethod: action.payload,
      };

    case orderActions.SET_ORDER_DATA:
      return {
        ...state,
        orderData: action.payload,
      };

    case orderActions.SET_SELECTED_ADDRESS:
      // Seçilen adresi güncelle
      return {
        ...state,
        selectedAddress: action.payload,
      };

    default:
      return state;
  }
};
