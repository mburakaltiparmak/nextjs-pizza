export const fetchStates = {
  NOT_FETCHED: "NOT_FETCHED",
  FETCHING: "FETCHING",
  FETCHED: "FETCHED",
  FAILED: "FAILED",
};

// State yapısını daha düz hale getirelim
const initialState = {
  products: [],
  categories: [],
  fetchState: fetchStates.NOT_FETCHED,
};

export const productActions = {
  setProductList: "SET_PRODUCT_LIST",
  setFetchState: "SET_FETCH_STATE",
  setCategories: "SET_CATEGORIES", // İsmi düzeltildi
};

export const productReducersFromApi = (state = initialState, action) => {
  switch (action.type) {
    case productActions.setProductList:
      return {
        ...state,
        products: action.payload,
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
    default:
      return state;
  }
};