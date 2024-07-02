// authSlice.js
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  accessToken: string | null;
}

const initialState: AuthState = {
  accessToken: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
      localStorage.setItem('accessToken', action.payload); // Store in local storage
    },
    clearAccessToken(state) {
      state.accessToken = null;
      localStorage.removeItem('accessToken'); // Remove from local storage
    },
  },
});

export const { setAccessToken, clearAccessToken } = authSlice.actions;
export default authSlice.reducer;
