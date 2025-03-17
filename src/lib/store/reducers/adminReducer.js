import { fetchStates, userStatus } from "../constants";

export const adminActions = {
  SET_ALL_USERS: "SET_ALL_USERS",
  SET_PENDING_USERS: "SET_PENDING_USERS",
  SET_DASHBOARD_DATA: "SET_DASHBOARD_DATA",
  UPDATE_USER_STATUS: "UPDATE_USER_STATUS",
  UPDATE_USER_ROLE: "UPDATE_USER_ROLE",
  SET_FETCH_STATE: "SET_ADMIN_FETCH_STATE",
  SET_ERROR: "SET_ADMIN_ERROR"
};

const adminInitialState = {
  allUsers: [],
  pendingUsers: [],
  dashboardData: null,
  fetchState: fetchStates.NOT_FETCHED,
  error: null
};

export const adminReducer = (state = adminInitialState, action) => {
  switch (action.type) {
    case adminActions.SET_ALL_USERS:
      return {
        ...state,
        allUsers: action.payload
      };
    case adminActions.SET_PENDING_USERS:
      return {
        ...state,
        pendingUsers: action.payload
      };
    case adminActions.SET_DASHBOARD_DATA:
      return {
        ...state,
        dashboardData: action.payload
      };
    case adminActions.UPDATE_USER_STATUS:
      return {
        ...state,
        allUsers: state.allUsers.map(user => 
          user.id === action.payload.userId 
            ? { ...user, status: action.payload.status } 
            : user
        ),
        pendingUsers: state.pendingUsers.filter(user => 
          user.id !== action.payload.userId || 
          (user.id === action.payload.userId && action.payload.status === userStatus.PENDING)
        )
      };
    case adminActions.UPDATE_USER_ROLE:
      return {
        ...state,
        allUsers: state.allUsers.map(user => 
          user.id === action.payload.userId 
            ? { ...user, role: action.payload.role } 
            : user
        )
      };
    case adminActions.SET_FETCH_STATE:
      return {
        ...state,
        fetchState: action.payload
      };
    case adminActions.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };
    default:
      return state;
  }
};