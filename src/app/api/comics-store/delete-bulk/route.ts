import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export async function DELETE(request: NextRequest) {
  const body = await request.json();

  if (!Array.isArray(body)) {
    return new NextResponse('Invalid request body, expected an array of comic IDs', { status: 400 });
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

  try {
    const { data, error } = await supabase
      .from('comics-sell')
      .delete()
      .in('id', body);

    if (error) throw error;

    return new NextResponse(JSON.stringify({ message: 'Comics deleted successfully' }), {
      status: 200,
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

// Method to delete multiple comics from the comics-sell table

// {
// 	"ids": [
// 	  "1",
// 	  "2",
// 	  "3"
// 	]
//   }

