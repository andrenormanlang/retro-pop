import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client'; // Adjust path based on your project structure

export async function GET(request: NextRequest) {
  const urlParams = new URL(request.url).searchParams;
  const page = parseInt(urlParams.get('page') || '1', 10);
  const limit = parseInt(urlParams.get('limit') || '15', 10);

  const offset = (page - 1) * limit;

  try {
    const { data, error } = await supabase
      .from('comics-sell')
      .select('*')
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    return new NextResponse(JSON.stringify(data), {
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
