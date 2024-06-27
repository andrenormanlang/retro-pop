// src/store/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  email: string;
  created: string;
  last_sign_in: string;
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
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
