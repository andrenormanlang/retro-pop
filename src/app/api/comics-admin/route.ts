import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string
);

export async function GET(request: NextRequest) {
  try {
    // Fetch comics with user profiles
    const { data: comicsData, error: comicsError } = await supabaseAdmin
      .from('comics-sell')
      .select(`
        *,
        profiles:profiles (id, username)
      `);

    if (comicsError) {
      console.error('Supabase comics query error:', comicsError);
      throw new Error(`Supabase query failed: ${comicsError.message}`);
    }

    // Fetch user emails from the authentication service
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error('Supabase auth query error:', authError);
      throw new Error(`Supabase auth query failed: ${authError.message}`);
    }

    // Merge the data based on user ID
    const mergedData = comicsData.map((comic) => {
      const profile = comic.profiles;
      const authUser = authData.users.find((user) => user.id === profile.id);
      return {
        ...comic,
        profiles: {
          ...profile,
          email: authUser ? authUser.email : null,
        },
      };
    });

    return new NextResponse(JSON.stringify(mergedData), {
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

export async function POST(request: NextRequest) {
  try {
    const { comicId, newStock, newPrice } = await request.json();

    const { data, error } = await supabaseAdmin
      .from('comics-sell')
      .update({ stock: newStock, price: newPrice })
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
