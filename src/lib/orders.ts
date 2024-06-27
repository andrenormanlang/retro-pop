import { CartItem } from "@/types/comics-store/comic-detail.type";
import { supabase } from "@/utils/supabaseClient";

export async function createOrder(userId: string, amount: number, currency: string, cartItems: CartItem[]) {
  // Fetch user details
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .single();

  if (userError) {
    throw new Error(userError.message);
  }

  const simplifiedItems = cartItems.map(item => ({
    id: item.comicId,
    title: item.title,
    price: item.price * 100,  // Convert price to cents
    currency: item.currency,
    image: item.image,
    quantity: item.quantity
  }));

  const { data, error } = await supabase
    .from("orders")
    .insert({ user_id: userId, user_name: user.username, total_amount: amount, currency: currency, items: simplifiedItems })
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error("Order creation failed");
  }

  return data;
}

export const updateStock = async (cartItems: CartItem[]) => {
  try {
    for (const item of cartItems) {
      const { data, error } = await supabase
        .from('comics_sell')
        .select('stock')
        .eq('id', item.comicId)
        .single();

      if (error) throw error;

      const newStock = data.stock - item.quantity;

      if (newStock < 0) throw new Error('Insufficient stock');

      const { error: updateError } = await supabase
        .from('comics_sell')
        .update({ stock: newStock })
        .eq('id', item.comicId);

      if (updateError) throw updateError;
    }
  } catch (error) {
    console.error('Error updating stock:', (error as Error).message);
  }
};

export const clearCart = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error clearing cart:', (error as Error).message);
  }
};
