import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import { orderReducer } from "./reducers/orderReducer";
import { productReducer } from "./reducers/productReducer";
import { productReducersFromApi } from "./reducers/productReducersFromApi";

export const API_BASE_URL = "http://localhost:9000/pizza/api";
export const store = configureStore({
  reducer: {
    order: orderReducer,
    product: productReducer,
    productAPI : productReducersFromApi
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});
