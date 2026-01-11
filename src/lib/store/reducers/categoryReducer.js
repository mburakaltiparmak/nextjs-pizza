import { fetchStates } from "../constants";

export const categoryActions = {
  SET_CATEGORIES: "SET_CATEGORIES",
  SET_SINGLE_CATEGORY: "SET_SINGLE_CATEGORY",
  ADD_CATEGORY: "ADD_CATEGORY",
  UPDATE_CATEGORY: "UPDATE_CATEGORY",
  DELETE_CATEGORY: "DELETE_CATEGORY",
  SET_FETCH_STATE: "SET_CATEGORY_FETCH_STATE",
  SET_ERROR: "SET_CATEGORY_ERROR",
  SET_PAGINATION: "SET_CATEGORY_PAGINATION"
};

const categoryInitialState = {
  categories: [],
  pagination: {
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0
  },
  currentCategory: null,
  fetchState: fetchStates.NOT_FETCHED,
  error: null
};

export const categoryReducer = (state = categoryInitialState, action) => {
  switch (action.type) {
    case categoryActions.SET_CATEGORIES:
      return {
        ...state,
        categories: action.payload
      };
    case categoryActions.SET_PAGINATION:
      return {
        ...state,
        pagination: action.payload
      };
    case categoryActions.SET_SINGLE_CATEGORY:
      return {
        ...state,
        currentCategory: action.payload
      };
    case categoryActions.ADD_CATEGORY:
      return {
        ...state,
        categories: [...state.categories, action.payload]
      };
    case categoryActions.UPDATE_CATEGORY:
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.id ? action.payload : category
        )
      };
    case categoryActions.DELETE_CATEGORY:
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload)
      };
    case categoryActions.SET_FETCH_STATE:
      return {
        ...state,
        fetchState: action.payload
      };
    case categoryActions.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };
    default:
      return state;
  }
};