import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { createClient } from '@/utils/supabase/client';
import { RootState } from './store';
import { WishlistItem } from '@/types/comics-store/comic-detail.type';

const supabase = createClient();

interface WishlistState {
  wishlist: WishlistItem[];
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  wishlist: [],
  loading: false,
  error: null,
};

export const fetchWishlist = createAsyncThunk<WishlistItem[], string>(
  'wishlist/fetchWishlist',
  async (userId: string) => {
    const { data, error } = await supabase
      .from('wishlists')
      .select('*, comics-sell(*)')
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    return data.map((item: any) => ({
      ...item,
      comic: item['comics-sell'],
    }));
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

export const updateWishlistQuantity = createAsyncThunk<{ comicId: string; stock: number }, { userId: string; comicId: string; stock: number }>(
  'wishlist/updateWishlistQuantity',
  async ({ userId, comicId, stock }) => {
    const { data, error } = await supabase
      .from('comics-sell')
      .select('stock')
      .eq('id', comicId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (stock < 1 || stock > data.stock) {
      throw new Error('Invalid stock value');
    }

    const { data: wishlistData, error: wishlistError } = await supabase
      .from('wishlists')
      .update({ stock })
      .eq('user_id', userId)
      .eq('comic_id', comicId)
      .select()
      .single();

    if (wishlistError) {
      throw new Error(wishlistError.message);
    }

    return { comicId, stock: wishlistData.stock };
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
      .addCase(fetchWishlist.fulfilled, (state, action: PayloadAction<WishlistItem[]>) => {
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
      .addCase(removeFromWishlist.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.wishlist = state.wishlist.filter(
          (comic) => comic.comic_id !== action.payload
        );
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to remove from wishlist';
      })
      .addCase(updateWishlistQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWishlistQuantity.fulfilled, (state, action: PayloadAction<{ comicId: string; stock: number }>) => {
        state.loading = false;
        const { comicId, stock } = action.payload;
        const comic = state.wishlist.find((item) => item.comic_id === comicId);
        if (comic) {
          comic.stock = stock;
        }
      })
      .addCase(updateWishlistQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update wishlist';
      });
  },
});

export default wishlistSlice.reducer;

