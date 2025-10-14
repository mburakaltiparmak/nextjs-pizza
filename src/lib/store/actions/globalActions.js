import { globalActions } from "../reducers/globalReducer";

export const setLoading = (isLoading) => ({
  type: globalActions.SET_LOADING,
  payload: isLoading,
});

export const setModuleLoading = (module, isLoading) => ({
  type: globalActions.SET_MODULE_LOADING,
  payload: { module, loading: isLoading },
});

export const setError = (error) => ({
  type: globalActions.SET_ERROR,
  payload: error,
});

export const setSuccess = (message) => ({
  type: globalActions.SET_SUCCESS,
  payload: message,
});

export const clearMessages = () => ({
  type: globalActions.CLEAR_MESSAGES,
});

export const clearError = () => ({
  type: globalActions.CLEAR_ERROR,
});

export const clearSuccess = () => ({
  type: globalActions.CLEAR_SUCCESS,
});

export const selectModuleLoading = (state, module) => {
  return state.global.moduleLoading[module] || false;
};

export const selectAnyModuleLoading = (state) => {
  return Object.values(state.global.moduleLoading).some(loading => loading);
};