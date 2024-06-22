// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import avatarReducer from './avatarSlice';
import wishlistReducer from './wishlistSlice';


export const store = configureStore({
  reducer: {
    user: userReducer,
	wishlist: wishlistReducer,
    avatar: avatarReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

