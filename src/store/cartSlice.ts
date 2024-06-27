import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { createClient } from '@/utils/supabase/client';
import { RootState } from './store';
import { CartItem } from '@/types/comics-store/comic-detail.type';

const supabase = createClient();

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

interface AddToCartPayload {
  userId: string;
  comicId: string;
  quantity: number;
  title: string;
  image: string;
  price: number;
  currency: string;
  stock: number;
}

interface AddToCartResponse {
  comicId: string;
  quantity: number;
  title: string;
  image: string;
  price: number;
  currency: string;
  stock: number;
}

interface UpdateCartQuantityPayload {
  userId: string;
  comicId: string;
  quantity: number;
}

interface FetchCartPayload {
  userId: string;
}

interface RemoveFromCartPayload {
  userId: string;
  comicId: string;
}

export const addToCart = createAsyncThunk<AddToCartResponse, AddToCartPayload, { state: RootState }>(
  'cart/addToCart',
  async ({ userId, comicId, quantity, title, image, price, currency, stock }) => {
    const { data: comic, error } = await supabase
      .from('comics-sell')
      .select('id, title, image, price, currency, stock')
      .eq('id', comicId)
      .single();

    if (error || !comic) {
      throw new Error(error?.message || 'Comic not found');
    }

    if (comic.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    const { data: existingCartItem, error: fetchError } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', userId)
      .eq('comic_id', comicId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(fetchError.message);
    }

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;
      const { error: updateError } = await supabase
        .from('cart')
        .update({ quantity: newQuantity })
        .eq('user_id', userId)
        .eq('comic_id', comicId);

      if (updateError) {
        throw new Error(updateError.message);
      }
    } else {
      const { error: insertError } = await supabase
        .from('cart')
        .insert({
          user_id: userId,
          comic_id: comicId,
          quantity,
          title: comic.title,
          image: comic.image,
          price: comic.price,
          currency: comic.currency,
          stock: comic.stock,
        });

      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    const { error: stockError } = await supabase
      .from('comics-sell')
      .update({ stock: comic.stock - quantity })
      .eq('id', comicId);

    if (stockError) {
      throw new Error(stockError.message);
    }

    return { comicId, quantity, title: comic.title, image: comic.image, price: comic.price, currency: comic.currency, stock: comic.stock };
  }
);

export const fetchCart = createAsyncThunk<CartItem[], FetchCartPayload>(
  'cart/fetchCart',
  async ({ userId }) => {
    const { data: cartItems, error } = await supabase
      .from('cart')
      .select('comic_id, quantity, title, image, price, currency, stock')
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    return cartItems.map(item => ({
      comicId: item.comic_id,
      quantity: item.quantity,
      title: item.title,
      image: item.image,
      price: item.price,
      currency: item.currency,
      stock: item.stock,
    }));
  }
);

export const updateCartQuantity = createAsyncThunk(
  'cart/updateCartQuantity',
  async ({ userId, comicId, quantity }: UpdateCartQuantityPayload) => {
    const { data: comic, error } = await supabase
      .from('comics-sell')
      .select('*')
      .eq('id', comicId)
      .single();

    if (error || !comic) {
      throw new Error(error?.message || 'Comic not found');
    }

    if (comic.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    const { data: existingCartItem, error: fetchError } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', userId)
      .eq('comic_id', comicId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(fetchError.message);
    }

    if (existingCartItem) {
      const { error: updateError } = await supabase
        .from('cart')
        .update({ quantity })
        .eq('user_id', userId)
        .eq('comic_id', comicId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      const { error: stockError } = await supabase
        .from('comics-sell')
        .update({ stock: comic.stock - (quantity - existingCartItem.quantity) })
        .eq('id', comicId);

      if (stockError) {
        throw new Error(stockError.message);
      }

      return { comicId, quantity };
    } else {
      throw new Error('Item not found in cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ userId, comicId }: RemoveFromCartPayload) => {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId)
      .eq('comic_id', comicId);

    if (error) {
      throw new Error(error.message);
    }

    return { comicId };
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action: PayloadAction<AddToCartPayload>) => {
        const { comicId, quantity, title, image, price, currency, stock } = action.payload;
        const existingItem = state.items.find(item => item.comicId === comicId);
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          state.items.push({ comicId, quantity, title, image, price, currency, stock });
        }
        state.loading = false;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add to cart';
      })
      .addCase(updateCartQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action: PayloadAction<UpdateCartQuantityPayload>) => {
        const { comicId, quantity } = action.payload;
        const existingItem = state.items.find(item => item.comicId === comicId);
        if (existingItem) {
          existingItem.quantity = quantity;
        }
        state.loading = false;
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update cart quantity';
      })
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch cart';
      })
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action: PayloadAction<{ comicId: string }>) => {
        state.items = state.items.filter(item => item.comicId !== action.payload.comicId);
        state.loading = false;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to remove from cart';
      });
  },
});

export default cartSlice.reducer;
