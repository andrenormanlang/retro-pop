import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AvatarState {
  url: string | null;
}

const initialState: AvatarState = {
  url: null,
};

const avatarSlice = createSlice({
  name: 'avatar',
  initialState,
  reducers: {
    setAvatarUrl(state, action: PayloadAction<string | null>) {
      state.url = action.payload;
    },
  },
});

export const { setAvatarUrl } = avatarSlice.actions;
export default avatarSlice.reducer;
