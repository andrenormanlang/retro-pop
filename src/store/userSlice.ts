// src/store/userSlice.ts
import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    email: null,
    avatarUrl: null,
    isAdmin: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.email = action.payload.email;
      state.avatarUrl = action.payload.avatarUrl;
      state.isAdmin = action.payload.isAdmin;
    },
    clearUser: (state) => {
      state.email = null;
      state.avatarUrl = null;
      state.isAdmin = false;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
