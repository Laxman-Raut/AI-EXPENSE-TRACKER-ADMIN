import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './uiSlice';
import adminReducer from './adminSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    admin: adminReducer,
  },
});
