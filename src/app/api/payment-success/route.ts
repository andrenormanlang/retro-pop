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
    // Check if a receipt already exists for this order
    const { data: existingReceipt, error: existingReceiptError } = await supabase
      .from('receipts')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', userId)
      .single();

    if (existingReceiptError && existingReceiptError.code !== 'PGRST116') { // 'PGRST116' is a Supabase specific error code for 'no rows found'
      throw existingReceiptError;
    }

    if (existingReceipt) {
      return new NextResponse(JSON.stringify({ message: 'Receipt already exists', receipt: existingReceipt }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

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
      .select();

    if (receiptError) throw receiptError;

    // Log the receipt details
    console.log('Receipt Details:', receiptData[0]);

    // Clear the cart
    console.log('Attempting to clear cart for user:', userId);
    const { error: clearCartError } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId);

    if (clearCartError) throw clearCartError;

    console.log('Cart cleared successfully for user:', userId);

    return new NextResponse(JSON.stringify({ message: 'Payment succeeded and receipt generated', receipt: receiptData[0] }), {
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





