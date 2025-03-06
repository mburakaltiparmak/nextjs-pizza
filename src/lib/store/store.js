import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import { orderReducer } from "./reducers/orderReducer";
import { productReducer } from "./reducers/productReducer";
import { productReducersFromApi } from "./reducers/productReducersFromApi";
import { categoryReducer } from "./reducers/categoryReducer";
import globalReducer from "./reducers/globalReducer";

export const API_BASE_URL = "http://localhost:9000/pizza/api";
export const fetchStates = {
  NOT_FETCHED: "NOT_FETCHED",
  FETCHING: "FETCHING",
  FETCHED: "FETCHED",
  FAILED: "FAILED",
};
export const store = configureStore({
  reducer: {
    order: orderReducer,
    product: productReducer,
    productAPI : productReducersFromApi,
    categoryAPI : categoryReducer,
    global : globalReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});
