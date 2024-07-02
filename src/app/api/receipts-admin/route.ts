import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string
);

export async function GET(request: NextRequest) {
  try {
    // Fetch receipts with user profiles
    const { data: receiptsData, error: receiptsError } = await supabaseAdmin
      .from('receipts')
      .select(`
        *,
        profiles:profiles (id, username)
      `);

    if (receiptsError) {
      console.error('Supabase receipts query error:', receiptsError);
      throw new Error(`Supabase query failed: ${receiptsError.message}`);
    }

    // Fetch user emails from the authentication service
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error('Supabase auth query error:', authError);
      throw new Error(`Supabase auth query failed: ${authError.message}`);
    }

    // Merge the data based on user ID
    const mergedData = receiptsData.map((receipt) => {
      const profile = receipt.profiles;
      const authUser = authData.users.find((user) => user.id === profile.id);
      return {
        ...receipt,
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
