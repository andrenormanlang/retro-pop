import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import avatarReducer from './avatarSlice';

export const store = configureStore({
  reducer: {
	// user: userReducer,
    avatar: avatarReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

