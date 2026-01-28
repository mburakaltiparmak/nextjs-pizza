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
import { promoCodeReducer } from "./reducers/promoCodeReducer";
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
    promoCode: promoCodeReducer,
  },
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: { warnAfter: 200 },
    }).concat(errorMiddleware);
    // Force logger for debugging
     middleware.push(logger);
    
    return middleware;
  },
  devTools: true, // Force devTools on
});


export default store;