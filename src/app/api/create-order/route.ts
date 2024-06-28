// src/app/api/create-order/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  const { amount, userId, cartItems } = await request.json();

  if (!amount || !userId || !cartItems || cartItems.length === 0) {
    return new NextResponse('Missing required fields', { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // Calculate the correct total amount (convert to subunits)
    const totalAmount = Math.round(amount);
    const currency = cartItems[0].currency;

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: currency,
      automatic_payment_methods: { enabled: true },
    });

    // Create an order in the database
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: totalAmount,
        currency: currency,
        items: cartItems,
      })
      .select();

    if (orderError) throw orderError;

    const orderId = orderData[0].id;

    return new NextResponse(JSON.stringify({ clientSecret: paymentIntent.client_secret, orderId }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
