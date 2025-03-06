export const fetchStates = {
    NOT_FETCHED: "NOT_FETCHED",
    FETCHING: "FETCHING",
    FETCHED: "FETCHED",
    FAILED: "FAILED",
  };

const initialState = {
  products: [],
  categories: [],
  fetchState: fetchStates.NOT_FETCHED,
  selectedCategory: null,
};
export const categoryActions = {
    setFetchState : "SET_FETCH_STATE",
    setSelectedCategory : "SET_SELECTED_CATEGORY",
    setCategories : "SET_CATEGORIES",
    
} 
export const categoryReducer = (state = initialState, action) => {
    switch (action.type) {
        case categoryActions.setFetchState:
            return {
                ...state,
                fetchState: action.payload,
            };
        case categoryActions.setSelectedCategory:
            return {
                ...state,
                selectedCategory: action.payload,
            };
        case categoryActions.setCategories:
            return {
                ...state,
                categories: action.payload,
            };
        default:
            return state;
    }
};