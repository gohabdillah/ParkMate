import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@features/auth/authSlice';
import carparkReducer from '@features/carpark/carparkSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    carpark: carparkReducer,
    // Add more reducers here
    // favorites: favoritesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
