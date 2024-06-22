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

// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { User } from '@supabase/supabase-js';

// interface UserState {
//   user: User | null;
// }

// const initialState: UserState = {
//   user: null,
// };

// const userSlice = createSlice({
//   name: 'user',
//   initialState,
//   reducers: {
//     setUser: (state, action: PayloadAction<User | null>) => {
//       state.user = action.payload;
//     },
//   },
// });

// export const { setUser } = userSlice.actions;
// export default userSlice.reducer;
