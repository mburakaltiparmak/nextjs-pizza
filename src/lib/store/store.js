import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import { userReducer } from "./reducers/userReducer";
import { categoryReducer } from "./reducers/categoryReducer";
import { productReducer } from "./reducers/productReducer";
import { adminReducer } from "./reducers/adminReducer";
import { orderReducer } from "./reducers/orderReducer";
import { globalReducer } from "./reducers/globalReducer";
import { guestReducer } from "./reducers/guestReducer";
import { initializeCart } from "./actions/orderActions";
import { initializeAuth } from "./actions/initAuth"; // Yeni eklenen import

export const store = configureStore({
  reducer: {
    user: userReducer,
    category: categoryReducer,
    product: productReducer,
    admin: adminReducer,
    order: orderReducer,
    guest: guestReducer,
    global: globalReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

// Initialize auth and cart from localStorage on app startup
setTimeout(() => {
  store.dispatch(initializeAuth()); // Önce auth bilgilerini başlat
  store.dispatch(initializeCart()); // Sonra sepet bilgilerini başlat
}, 0);

export default store;