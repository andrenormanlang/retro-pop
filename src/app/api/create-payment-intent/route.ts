import { createOrder, updateStock } from "@/lib/orders";
import { WishlistItem } from "@/types/comics-store/comic-detail.type";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

export async function POST(request: NextRequest) {
  try {
    const { amount, userId, wishlistItems }: { amount: number; userId: string; wishlistItems: WishlistItem[] } = await request.json();

    // Calculate the correct total amount (convert to subunits)
    const totalAmount = Math.round(wishlistItems.reduce((total, item) => total + item.comic.price * item.stock, 0) * 100);

    const currency = wishlistItems[0].comic.currency;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: currency,
      automatic_payment_methods: { enabled: true },
    });

    const order = await createOrder(userId, totalAmount, currency, wishlistItems);

    // Update the stock after creating the order
    await updateStock(wishlistItems);

    return NextResponse.json({ clientSecret: paymentIntent.client_secret, orderId: order[0].id });
  } catch (error) {
    console.error("Internal Error:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}









