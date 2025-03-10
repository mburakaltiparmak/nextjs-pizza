import { fetchStates } from "../constants";

export const userActions = {
    SET_EMAIL: "SET_EMAIL",
    SET_REMEMBER_ME: "SET_REMEMBER_ME",
    SET_IS_LOGIN: "SET_IS_LOGIN",
    SET_TOKEN: "SET_TOKEN",
    SET_USER_PROFILE: "SET_USER_PROFILE",
    SET_USER_STATUS: "SET_USER_STATUS",
    SET_USER_ROLE: "SET_USER_ROLE",
    SET_FETCH_STATE: "SET_FETCH_STATE",
    CLEAR_USER_DATA: "CLEAR_USER_DATA"
  };
  
  const initialState = {
    email: "",
    rememberMe: false,
    isLogin: false,
    token: null,
    profile: null, // kullanıcı profil bilgileri
    status: null, // PENDING, ACTIVE, LOCKED, REJECTED
    role: null, // ADMIN, PERSONAL, CUSTOMER, GUEST
    fetchState: fetchStates.NOT_FETCHED
  };
  
  export const userReducer = (state = initialState, action) => {
    switch (action.type) {
      case userActions.SET_EMAIL:
        return {
          ...state,
          email: action.payload
        };
      case userActions.SET_REMEMBER_ME:
        return {
          ...state,
          rememberMe: action.payload
        };
      case userActions.SET_IS_LOGIN:
        return {
          ...state,
          isLogin: action.payload
        };
      case userActions.SET_TOKEN:
        return {
          ...state,
          token: action.payload
        };
      case userActions.SET_USER_PROFILE:
        return {
          ...state,
          profile: action.payload
        };
      case userActions.SET_USER_STATUS:
        return {
          ...state,
          status: action.payload
        };
      case userActions.SET_USER_ROLE:
        return {
          ...state,
          role: action.payload
        };
      case userActions.SET_FETCH_STATE:
        return {
          ...state,
          fetchState: action.payload
        };
      case userActions.CLEAR_USER_DATA:
        return {
          ...initialState
        };
      default:
        return state;
    }
  };