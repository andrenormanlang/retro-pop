// src/store/wishlistSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createClient } from '@/utils/supabase/client';
import { RootState } from './store';

const supabase = createClient();

interface WishlistState {
  wishlist: any[];
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  wishlist: [],
  loading: false,
  error: null,
};

export const fetchWishlist = createAsyncThunk<any[], string>(
  'wishlist/fetchWishlist',
  async (userId: string) => {
    const { data, error } = await supabase
      .from('wishlists')
      .select('*, comics-sell(*)')
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    return data.map((item: any) => item['comics-sell']);
  }
);

export const removeFromWishlist = createAsyncThunk<string, { userId: string; comicId: string }>(
	'wishlist/removeFromWishlist',
	async ({ userId, comicId }) => {
	  const { error } = await supabase
		.from('wishlists')
		.delete()
		.eq('user_id', userId)
		.eq('comic_id', comicId);

	  if (error) {
		throw new Error(error.message);
	  }

	  return comicId;
	}
  );

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch wishlist';
      })
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = state.wishlist.filter(
          (comic) => comic.id !== action.payload
        );
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to remove from wishlist';
      });
  },
});

export default wishlistSlice.reducer;
