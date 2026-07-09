import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import analyticsReducer from './slices/analyticsSlice';
import ticketReducer from './slices/ticketSlice';
import propertyReducer from './slices/propertySlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    analytics: analyticsReducer,
    tickets: ticketReducer,
    properties: propertyReducer,
  },
});

export default store;
