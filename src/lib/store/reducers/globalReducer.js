export const globalActions = {
  SET_LOADING: "SET_LOADING",
  SET_MODULE_LOADING: "SET_MODULE_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_SUCCESS: "SET_SUCCESS",
  CLEAR_MESSAGES: "CLEAR_MESSAGES",
  CLEAR_ERROR: "CLEAR_ERROR",
  CLEAR_SUCCESS: "CLEAR_SUCCESS",
};

const globalInitialState = {
  loading: false,
  moduleLoading: {
    category: false,
    product: false,
    user: false,
    admin: false,
    order: false,
  },
  error: null,
  success: null,
};

export const globalReducer = (state = globalInitialState, action) => {
  switch (action.type) {
    case globalActions.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case globalActions.SET_MODULE_LOADING:
      return {
        ...state,
        moduleLoading: {
          ...state.moduleLoading,
          [action.payload.module]: action.payload.loading,
        },
      };

    case globalActions.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        success: null,
      };

    case globalActions.SET_SUCCESS:
      return {
        ...state,
        success: action.payload,
        error: null,
      };

    case globalActions.CLEAR_MESSAGES:
      return {
        ...state,
        error: null,
        success: null,
      };

    case globalActions.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case globalActions.CLEAR_SUCCESS:
      return {
        ...state,
        success: null,
      };

    default:
      return state;
  }
};