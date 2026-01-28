import { fetchStates } from "../constants";

export const promoCodeActions = {
  SET_PROMO_CODES: "SET_PROMO_CODES",
  ADD_PROMO_CODE: "ADD_PROMO_CODE",
  UPDATE_PROMO_CODE: "UPDATE_PROMO_CODE",
  DELETE_PROMO_CODE: "DELETE_PROMO_CODE",
  SET_CURRENT_PROMO_CODE: "SET_CURRENT_PROMO_CODE",
  CLEAR_CURRENT_PROMO_CODE: "CLEAR_CURRENT_PROMO_CODE",
  SET_FETCH_STATE: "SET_PROMO_CODE_FETCH_STATE",
  SET_ERROR: "SET_PROMO_CODE_ERROR",
  RESET_PROMO_CODE_STATE: "RESET_PROMO_CODE_STATE",
};

const promoCodeInitialState = {
  promoCodes: [],
  currentPromoCode: null,
  fetchState: fetchStates.NOT_FETCHED,
  error: null,
};

export const promoCodeReducer = (state = promoCodeInitialState, action) => {
  switch (action.type) {
    case promoCodeActions.SET_PROMO_CODES:
      return {
        ...state,
        promoCodes: action.payload,
      };

    case promoCodeActions.ADD_PROMO_CODE:
      return {
        ...state,
        promoCodes: [...state.promoCodes, action.payload],
      };

    case promoCodeActions.UPDATE_PROMO_CODE:
      return {
        ...state,
        promoCodes: state.promoCodes.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
        currentPromoCode:
          state.currentPromoCode?.id === action.payload.id
            ? action.payload
            : state.currentPromoCode,
      };

    case promoCodeActions.DELETE_PROMO_CODE:
      return {
        ...state,
        promoCodes: state.promoCodes.filter(
          (item) => item.id !== action.payload
        ),
        currentPromoCode:
          state.currentPromoCode?.id === action.payload
            ? null
            : state.currentPromoCode,
      };

    case promoCodeActions.SET_CURRENT_PROMO_CODE:
      return {
        ...state,
        currentPromoCode: action.payload,
      };

    case promoCodeActions.CLEAR_CURRENT_PROMO_CODE:
      return {
        ...state,
        currentPromoCode: null,
      };

    case promoCodeActions.SET_FETCH_STATE:
      return {
        ...state,
        fetchState: action.payload,
      };

    case promoCodeActions.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case promoCodeActions.RESET_PROMO_CODE_STATE:
      return promoCodeInitialState;

    default:
      return state;
  }
};
