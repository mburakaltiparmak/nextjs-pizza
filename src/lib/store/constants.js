export const API_BASE_URL = "https://pizza-backend.fly.dev/pizza";
//export const API_BASE_URL = "http://localhost:8080/pizza/api";

export const fetchStates = {
  NOT_FETCHED: "NOT_FETCHED",
  FETCHING: "FETCHING",
  FETCHED: "FETCHED",
  FAILED: "FAILED",
};

export const userStatus = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  LOCKED: "LOCKED",
  REJECTED: "REJECTED",
};

export const userRoles = {
  ADMIN: "ADMIN",
  PERSONAL: "PERSONAL",
  CUSTOMER: "CUSTOMER",
  GUEST: "GUEST",
};
