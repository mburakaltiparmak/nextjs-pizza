import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import { userReducer } from "./reducers/userReducer";
import { categoryReducer } from "./reducers/categoryReducer";
import { productReducer } from "./reducers/productReducer";
import { adminReducer } from "./reducers/adminReducer";
import { orderReducer } from "./reducers/orderReducer";
import { globalReducer } from "./reducers/globalReducer";
import { guestReducer } from "./reducers/guestReducer";
import appReducer from "./reducers/appReducer";
import { errorMiddleware } from "./middleware/errorMiddleware";

export const store = configureStore({
  reducer: {
    user: userReducer,
    category: categoryReducer,
    product: productReducer,
    admin: adminReducer,
    order: orderReducer,
    guest: guestReducer,
    global: globalReducer,
    app: appReducer,
  },
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware().concat(errorMiddleware);
    if (process.env.NODE_ENV !== "production") {
      middleware.push(logger);
    }
    return middleware;
  },
  devTools: process.env.NODE_ENV !== "production",
});


export default store;