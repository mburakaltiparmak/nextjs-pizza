import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';
import { errorMiddleware } from './middleware/errorMiddleware';
import logger from 'redux-logger';

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false })
            .concat(errorMiddleware)
            .concat(logger),
    devTools: process.env.NODE_ENV !== 'production',
});

export default store;
