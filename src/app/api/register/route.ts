// app/api/register/route.js
import { NextResponse, NextRequest } from 'next/server';
import { supabaseRegister } from '../../../utils/supabaseRegister';

export async function POST(request: NextRequest) {
  const { email, password, first_name, last_name, avatar_url, is_admin } = await request.json();

  // Insert the new user into the database
  const { data, error } = await supabaseRegister
    .from('users')
    .insert([
      {
        email,
        password, // Ideally, you should hash the password before storing it
        first_name,
        last_name,
        avatar_url,
        is_admin,
      },
    ]);

  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new NextResponse(JSON.stringify({ user: data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
