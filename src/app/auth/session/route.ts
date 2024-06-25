// src/app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client'; // Adjust path based on your project structure

export async function GET(request: NextRequest) {
  try {
    const { data: session, error } = await supabase.auth.getSession();

    if (error) {
      throw new Error(`Failed to fetch session: ${error.message}`);
    }

    return NextResponse.json(session, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
