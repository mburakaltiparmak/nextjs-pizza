import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import { userReducer } from "./reducers/userReducer";
import { categoryReducer } from "./reducers/categoryReducer";
import { productReducer } from "./reducers/productReducer";
import { adminReducer } from "./reducers/adminReducer";
import { orderReducer } from "./reducers/orderReducer";
import { globalReducer } from "./reducers/globalReducer";

export const store = configureStore({
  reducer: {
    user: userReducer,
    category: categoryReducer,
    product: productReducer,
    admin: adminReducer,
    order: orderReducer,
    global: globalReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger)
});
export default store;