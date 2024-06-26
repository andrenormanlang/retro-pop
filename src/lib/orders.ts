import { WishlistItem } from "@/types/comics-store/comic-detail.type";
import { supabase } from "@/utils/supabaseClient";

export async function createOrder(userId: string, amount: number, currency: string, wishlistItems: WishlistItem[]) {
	// Fetch user details
	const { data: user, error: userError } = await supabase
	  .from('profiles')
	  .select('username')
	  .eq('id', userId)
	  .single();

	if (userError) {
	  throw new Error(userError.message);
	}

	const simplifiedItems = wishlistItems.map(item => ({
	  id: item.id,
	  comic_id: item.comic_id,
	  title: item.comic.title,
	  price: item.comic.price * 100,  // Convert price to cents
	  currency: item.comic.currency,
	  image: item.comic.image,
	  quantity: item.stock
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
  
export async function updateStock(wishlistItems: WishlistItem[]) {
  for (const item of wishlistItems) {
    const { comic_id, stock } = item;

    if (!comic_id || stock === undefined) {
      throw new Error("Invalid item data");
    }

    const { error } = await supabase
      .from("comics-sell")
      .update({ stock })
      .eq("id", comic_id);

    if (error) {
      throw new Error(error.message);
    }
  }
}
