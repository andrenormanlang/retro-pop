// src/app/api/confirm-payment/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export async function POST(request: NextRequest) {
  const { orderId, cartItems } = await request.json();

  if (!orderId || !cartItems || cartItems.length === 0) {
    return new NextResponse('Missing required fields', { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // Update the stock after creating the order
    for (const item of cartItems) {
      const { data: comicData, error: comicError } = await supabase
        .from('comics_sell')
        .select('stock')
        .eq('id', item.comicId)
        .single();

      if (comicError || !comicData) {
        throw new Error('Error updating stock');
      }

      const newStock = comicData.stock - item.quantity;

      if (newStock < 0) {
        throw new Error('Insufficient stock');
      }

      const { error: updateError } = await supabase
        .from('comics_sell')
        .update({ stock: newStock })
        .eq('id', item.comicId);

      if (updateError) throw updateError;
    }

    // Generate a receipt
    const { data: receiptData, error: receiptError } = await supabase
      .from('receipts')
      .insert({
        order_id: orderId,
        items: cartItems,
      })
      .select();

    if (receiptError) throw receiptError;

    // Clear the cart
    const { error: clearCartError } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', cartItems[0].userId);

    if (clearCartError) throw clearCartError;

    return new NextResponse(JSON.stringify({ message: 'Payment confirmed and receipt generated' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
