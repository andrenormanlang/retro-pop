// src/store/userSlice.ts
import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    email: null,
    avatarUrl: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.email = action.payload.email;
      state.avatarUrl = action.payload.avatarUrl;
    },
    clearUser: (state) => {
      state.email = null;
      state.avatarUrl = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
