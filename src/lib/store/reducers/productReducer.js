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
  categories: [],
  loading: null,
};

export const productActions = {
  setProductList: "SET_PRODUCT_LIST",
  setFetchState: "SET_FETCH_STATE",
  setSelectedCategory: "SET_SELECTED_CATEGORY",
  setCategories: "SET_ITEMS_BY_CATEGORY",
  setLoading: "SET_LOADING",
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
    case productActions.setCategories:
      return {
        ...state,
        categories: action.payload,
      };
    case productActions.setLoading:
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};
