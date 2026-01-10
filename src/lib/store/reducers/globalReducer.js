import {
  SET_LOADING,
  SET_MODULE_LOADING,
  SET_ERROR,
  SET_SUCCESS,
  CLEAR_MESSAGES,
  CLEAR_ERROR,
  CLEAR_SUCCESS,
  SET_INITIALIZED
} from '../actions/globalActions';

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
  initialized: false
};

export const globalReducer = (state = globalInitialState, action) => {
  switch (action.type) {
    case SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case SET_MODULE_LOADING:
      return {
        ...state,
        moduleLoading: {
          ...state.moduleLoading,
          [action.payload.module]: action.payload.loading,
        },
      };

    case SET_ERROR:
      return {
        ...state,
        error: action.payload,
        success: null,
      };

    case SET_SUCCESS:
      return {
        ...state,
        success: action.payload,
        error: null,
      };

    case CLEAR_MESSAGES:
      return {
        ...state,
        error: null,
        success: null,
      };

    case CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case CLEAR_SUCCESS:
      return {
        ...state,
        success: null,
      };

    case SET_INITIALIZED:
      return {
        ...state,
        initialized: action.payload
      };

    default:
      return state;
  }
};
