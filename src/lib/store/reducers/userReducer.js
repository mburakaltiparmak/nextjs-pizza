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
  SET_AUTH_PROVIDER: "SET_AUTH_PROVIDER",
  CLEAR_USER_DATA: "CLEAR_USER_DATA",
  // Adres yönetimi için yeni action tipleri
  SET_USER_ADDRESSES: "SET_USER_ADDRESSES",
  ADD_USER_ADDRESS: "ADD_USER_ADDRESS",
  UPDATE_USER_ADDRESS: "UPDATE_USER_ADDRESS",
  REMOVE_USER_ADDRESS: "REMOVE_USER_ADDRESS",
  SET_DEFAULT_ADDRESS: "SET_DEFAULT_ADDRESS",
  // Token expiration
  SET_TOKEN_EXPIRATION: "SET_TOKEN_EXPIRATION",
};

const initialState = {
  email: "",
  rememberMe: false,
  isLogin: false,
  token: null,
  profile: null, // kullanıcı profil bilgileri
  status: null, // PENDING, ACTIVE, LOCKED, REJECTED
  role: null, // ADMIN, PERSONAL, CUSTOMER, GUEST
  authProvider: null, // "email", "google", "apple" vb.
  fetchState: fetchStates.NOT_FETCHED,
  addresses: [], // Kullanıcının kayıtlı adresleri
  tokenExpiresAt: null, // Token bitiş zamanı (ms)
  tokenExpiresIn: null, // Token bitiş süresi (saniye)
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
    case userActions.SET_AUTH_PROVIDER:
      return {
        ...state,
        authProvider: action.payload
      };
    case userActions.CLEAR_USER_DATA:
      return {
        ...initialState
      };

    // Adres yönetimi için yeni reducer case'leri
    case userActions.SET_USER_ADDRESSES:
      return {
        ...state,
        addresses: action.payload
      };

    case userActions.ADD_USER_ADDRESS:
      return {
        ...state,
        addresses: [...state.addresses, action.payload]
      };

    case userActions.UPDATE_USER_ADDRESS:
      return {
        ...state,
        addresses: state.addresses.map(address =>
          address.id === action.payload.id ? action.payload : address
        )
      };

    case userActions.REMOVE_USER_ADDRESS:
      return {
        ...state,
        addresses: state.addresses.filter(address =>
          address.id !== action.payload
        )
      };

    case userActions.SET_DEFAULT_ADDRESS:
      return {
        ...state,
        addresses: state.addresses.map(address => ({
          ...address,
          isDefault: address.id === action.payload
        }))
      };

    case userActions.SET_TOKEN_EXPIRATION:
      return {
        ...state,
        tokenExpiresAt: action.payload.expiresAt,
        tokenExpiresIn: action.payload.expiresIn,
      };

    default:
      return state;
  }
};