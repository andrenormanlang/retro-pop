import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  const userId = searchParams.get('userId');

  if (!orderId || !userId) {
    return new NextResponse('Missing required fields', { status: 400 });
  }

  try {
    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    // Create a receipt
    const { data: receiptData, error: receiptError } = await supabase
      .from('receipts')
      .insert({
        user_id: userId,
        order_id: orderId,
        total_amount: order.total_amount,
        currency: order.currency,
        items: order.items,
      })
      .select()
      .single();

    if (receiptError) throw receiptError;

    if (!receiptData) {
      throw new Error('Receipt data is null or undefined');
    }

    // Clear the cart
    const { error: clearCartError } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId);

    if (clearCartError) throw clearCartError;

    return new NextResponse(JSON.stringify({ message: 'Payment succeeded and receipt generated', receiptId: receiptData.id }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error processing payment success:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
