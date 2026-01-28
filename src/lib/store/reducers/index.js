import { combineReducers } from 'redux';
import { userReducer } from "./userReducer";
import { categoryReducer } from "./categoryReducer";
import { productReducer } from "./productReducer";
import { adminReducer } from "./adminReducer";
import { orderReducer } from "./orderReducer";
import { globalReducer } from "./globalReducer";
import { guestReducer } from "./guestReducer";
import appReducer from "./appReducer";
import { promoCodeReducer } from "./promoCodeReducer";

const rootReducer = combineReducers({
    user: userReducer,
    category: categoryReducer,
    product: productReducer,
    admin: adminReducer,
    order: orderReducer,
    guest: guestReducer,
    global: globalReducer,
    app: appReducer,
    promoCode: promoCodeReducer,
});

export default rootReducer;
