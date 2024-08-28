import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import { orderReducer } from "./reducers/orderReducer";
import { productReducer } from "./reducers/productReducer";

export const store = configureStore({
  reducer: {
    order: orderReducer,
    product: productReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});
