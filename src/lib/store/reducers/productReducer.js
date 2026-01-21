import { fetchStates } from "../constants";

export const productActions = {
  SET_PRODUCTS: "SET_PRODUCTS",
  ADD_PRODUCT: "ADD_PRODUCT",
  UPDATE_PRODUCT: "UPDATE_PRODUCT",
  DELETE_PRODUCT: "DELETE_PRODUCT",
  SET_CURRENT_PRODUCT: "SET_CURRENT_PRODUCT",
  CLEAR_CURRENT_PRODUCT: "CLEAR_CURRENT_PRODUCT",
  SET_SELECTED_CATEGORY: "SET_SELECTED_CATEGORY",
  SET_FETCH_STATE: "SET_PRODUCT_FETCH_STATE",
  SET_ERROR: "SET_PRODUCT_ERROR",
  SET_PAGINATION: "SET_PRODUCT_PAGINATION",
  RESET_PRODUCT_STATE: "RESET_PRODUCT_STATE",
};

const productInitialState = {
  products: [],
  pagination: {
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  },
  currentProduct: null,
  selectedCategory: null,
  fetchState: fetchStates.NOT_FETCHED,
  currentProductFetchState: fetchStates.NOT_FETCHED,
  error: null,
};

export const productReducer = (state = productInitialState, action) => {
  switch (action.type) {
    case productActions.SET_PRODUCTS:
      return {
        ...state,
        products: action.payload,
      };

    case productActions.SET_PAGINATION:
      return {
        ...state,
        pagination: action.payload,
      };

    case productActions.ADD_PRODUCT:
      const existingProduct = state.products.find(
        (p) => p.id === action.payload.id
      );
      if (existingProduct) {
        return {
          ...state,
          products: state.products.map((p) =>
            p.id === action.payload.id ? action.payload : p
          ),
        };
      }
      return {
        ...state,
        products: [...state.products, action.payload],
      };

    case productActions.UPDATE_PRODUCT:
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.id ? action.payload : product
        ),
        currentProduct:
          state.currentProduct?.id === action.payload.id
            ? action.payload
            : state.currentProduct,
      };

    case productActions.DELETE_PRODUCT:
      return {
        ...state,
        products: state.products.filter(
          (product) => product.id !== action.payload
        ),
        currentProduct:
          state.currentProduct?.id === action.payload
            ? null
            : state.currentProduct,
      };

    case productActions.SET_CURRENT_PRODUCT:
      return {
        ...state,
        currentProduct: action.payload,
        currentProductFetchState: fetchStates.FETCHED,
      };

    case productActions.CLEAR_CURRENT_PRODUCT:
      return {
        ...state,
        currentProduct: null,
        currentProductFetchState: fetchStates.NOT_FETCHED,
      };

    case productActions.SET_SELECTED_CATEGORY:
      return {
        ...state,
        selectedCategory: action.payload,
      };

    case productActions.SET_FETCH_STATE:
      return {
        ...state,
        fetchState: action.payload,
      };

    case productActions.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case productActions.RESET_PRODUCT_STATE:
      return productInitialState;

    default:
      return state;
  }
};