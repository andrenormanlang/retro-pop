import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client'; // Adjust path based on your project structure

export async function GET(request: NextRequest) {
  const comicId = request.nextUrl.pathname.split('/').pop();

  if (!comicId) {
    return new NextResponse('Comic ID is required', { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('comics-sell')
      .select(`
        id,
        user_id,
        created_at,
        title,
        image,
        release_date,
        pages,
        publisher,
        main_artist,
        main_writer,
        description,
        price,
        currency
      `)
      .eq('id', comicId)
      .single();

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
