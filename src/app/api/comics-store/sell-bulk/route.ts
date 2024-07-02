import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!Array.isArray(body)) {
    return new NextResponse('Invalid request body, expected an array of comics', { status: 400 });
  }

  const user_id = request.headers.get('x-user-id');
  const bearerToken = request.headers.get('Authorization');

  if (!user_id || !bearerToken) {
    return new NextResponse('Missing user ID or authorization token', { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: bearerToken as string,
      },
    },
  });

  const comics = body.map(comic => {
    const {
      image,
      title,
      genre,
      publisher,
      release_date,
      price,
      pages,
      main_artist,
      main_writer,
      description,
      currency,
    } = comic;

    if (!title || !genre || !publisher || !release_date || !price || !pages || !main_artist || !main_writer || !description || !currency) {
      throw new Error('Missing required fields in one of the comics');
    }

    return {
      id: uuidv4(),
      image,
      title,
      genre,
      publisher,
      release_date,
      price,
      pages,
      main_artist,
      main_writer,
      description,
      currency,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id,
    };
  });

  try {
    const { error } = await supabase.from('comics-sell').insert(comics);

    if (error) throw error;

    return new NextResponse(JSON.stringify({ message: 'Comics posted for sale successfully' }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
