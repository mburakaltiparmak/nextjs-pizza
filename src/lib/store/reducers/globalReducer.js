export const globalActions = {
    SET_LOADING: "SET_LOADING",
    SET_ERROR: "SET_ERROR",
    SET_SUCCESS: "SET_SUCCESS",
    CLEAR_MESSAGES: "CLEAR_MESSAGES"
  };
  
  const globalInitialState = {
    loading: false,
    error: null,
    success: null
  };
  
  export const globalReducer = (state = globalInitialState, action) => {
    switch (action.type) {
      case globalActions.SET_LOADING:
        return {
          ...state,
          loading: action.payload
        };
      case globalActions.SET_ERROR:
        return {
          ...state,
          error: action.payload
        };
      case globalActions.SET_SUCCESS:
        return {
          ...state,
          success: action.payload
        };
      case globalActions.CLEAR_MESSAGES:
        return {
          ...state,
          error: null,
          success: null
        };
      default:
        return state;
    }
  };