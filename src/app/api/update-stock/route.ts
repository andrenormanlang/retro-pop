import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(request: NextRequest) {
  try {
    const { comicId, newStock } = await request.json();

    const { data, error } = await supabaseAdmin
      .from('comics-sell')
      .update({ stock: newStock })
      .eq('id', comicId)
      .select();

    if (error) {
      console.error('Supabase update error:', error);
      throw new Error(`Supabase update failed: ${error.message}`);
    }

    return new NextResponse(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('API route error:', message);
    return new NextResponse(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
