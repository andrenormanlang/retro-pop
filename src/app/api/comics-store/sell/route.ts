import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    image,
    title,
    publisher,
    release_date,
    price,
    pages,
    main_artist,
    main_writer,
    description,
    currency,
  } = body;

  const user_id = request.headers.get('x-user-id');
  const bearerToken = request.headers.get('Authorization');

  if (!user_id || !title || !publisher || !release_date || !price || !pages || !main_artist || !main_writer || !description || !currency) {
    return new NextResponse('Missing required fields', { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: bearerToken as string,
      },
    },
  });

  try {
    const id = uuidv4(); // Generate a new UUID here

    const { error } = await supabase.from('comics-sell').insert([
      {
        id, // Use the generated UUID
        image,
        title,
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
        user_id, // Include the user ID here
      },
    ]);

    if (error) throw error;

    return new NextResponse(JSON.stringify({ message: 'Comic book posted for sale successfully', id }), {
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
