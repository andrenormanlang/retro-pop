import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export async function PUT(request: NextRequest) {
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

  try {
    const updates = body.map(comic => {
      const { id, ...updates } = comic;

      if (!id) {
        throw new Error('Missing comic ID');
      }

      return supabase
        .from('comics-sell')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    });

    // Execute all update promises
    const results = await Promise.all(updates);

    // Check for errors in the results
    const errors = results.filter(result => result.error);

    if (errors.length > 0) {
      throw new Error(errors.map(err => err.error?.message ?? 'Unknown error').join(', '));
    }

    return new NextResponse(JSON.stringify({ message: 'Comics updated successfully' }), {
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

// Method to update multiple comics in the comics-sell table

// [
// 	{
// 	  "id": "id1",
// 	  "title": "New Title",
// 	  "price": 500,
// 	  // other fields to update
// 	},
// 	{
// 	  "id": "id2",
// 	  "title": "Another New Title",
// 	  "price": 600,
// 	  // other fields to update
// 	}
//   ]


// Make sure to include the x-user-id and Authorization headers in your request.

// This endpoint will update the specified fields of the comics with the given IDs in the comics-sell table in your Supabase database.
