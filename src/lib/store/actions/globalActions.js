// Action Types
export const SET_LOADING = 'SET_LOADING';
export const SET_MODULE_LOADING = 'SET_MODULE_LOADING';
export const SET_ERROR = 'SET_ERROR';
export const SET_SUCCESS = 'SET_SUCCESS';
export const CLEAR_MESSAGES = 'CLEAR_MESSAGES';
export const CLEAR_ERROR = 'CLEAR_ERROR';
export const CLEAR_SUCCESS = 'CLEAR_SUCCESS';
export const SET_INITIALIZED = 'SET_INITIALIZED'; // As per refactoring guide

// Action Creators
export const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading,
});

export const setModuleLoading = (module, isLoading) => ({
  type: SET_MODULE_LOADING,
  payload: { module, loading: isLoading },
});

export const setError = (error) => ({
  type: SET_ERROR,
  payload: error,
});

export const setSuccess = (message) => ({
  type: SET_SUCCESS,
  payload: message,
});

export const clearMessages = () => ({
  type: CLEAR_MESSAGES,
});

export const clearError = () => ({
  type: CLEAR_ERROR,
});

export const clearSuccess = () => ({
  type: CLEAR_SUCCESS,
});

export const setInitialized = (initialized) => ({
  type: SET_INITIALIZED,
  payload: initialized
});

// Selectors
export const selectModuleLoading = (state, module) => {
  return state.global.moduleLoading[module] || false;
};

export const selectAnyModuleLoading = (state) => {
  return Object.values(state.global.moduleLoading).some(loading => loading);
};
