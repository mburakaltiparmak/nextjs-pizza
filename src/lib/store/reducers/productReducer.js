import { act } from "react";

export const fetchStates = {
  NOT_FETCHED: "NOT_FETCHED",
  FETCHING: "FETCHING",
  FETCHED: "FETCHED",
  FAILED: "FAILED",
};
const initialState = {
  products: [],
  fetchState: fetchStates.NOT_FETCHED,
  selectedCategory: null,
  itemsByCategory: [],
};

export const productActions = {
  setProductList: "SET_PRODUCT_LIST",
  setFetchState: "SET_FETCH_STATE",
  setSelectedCategory: "SET_SELECTED_CATEGORY",
  setItemsByCategory: "SET_ITEMS_BY_CATEGORY",
  
};

export const productReducer = (state = initialState, action) => {
  switch (action.type) {
    case productActions.setProductList:
      return {
        ...state,
        products: action.payload,
      };
    case productActions.setSelectedCategory:
      return {
        ...state,
        selectedCategory: action.payload,
      };
    case productActions.setFetchState:
      return {
        ...state,
        fetchState: action.payload,
      };
    case productActions.setItemsByCategory:
      return {
        ...state,
        itemsByCategory: action.payload,
      };
    default:
      return state;
  }
};
