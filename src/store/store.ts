// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import avatarReducer from './avatarSlice';
import cartReducer from './cartSlice'; // Import the cart reducer
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer, // Corrected the reducer name
    avatar: avatarReducer,
	auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;


