import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import analyticsReducer from './slices/analyticsSlice';
import ticketReducer from './slices/ticketSlice';
import propertyReducer from './slices/propertySlice';
import contractorReducer from './slices/contractorSlice';
import jobReducer from './slices/jobSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    analytics: analyticsReducer,
    tickets: ticketReducer,
    properties: propertyReducer,
    contractors: contractorReducer,
    jobs: jobReducer,
  },
});

export default store;
