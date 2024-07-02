import { supabase } from "@/utils/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
	  const { searchParams } = new URL(request.url);
	  const userId = searchParams.get('userId');

	  if (!userId) {
		console.error('User ID is missing');
		return new NextResponse(JSON.stringify({ error: 'User ID is required' }), {
		  status: 400,
		  headers: { 'Content-Type': 'application/json' },
		});
	  }

	  const { data, error } = await supabase
		.from('profiles')
		.select('avatar_url')
		.eq('id', userId)
		.single();

	  if (error) {
		console.error('Error fetching avatar:', error.message);
		throw error;
	  }

	  console.log('Avatar URL fetched successfully:', data.avatar_url);
	  return new NextResponse(JSON.stringify({ avatarUrl: data.avatar_url }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	  });
	} catch (error: any) {
	  console.error('Server error:', error.message);
	  return new NextResponse(JSON.stringify({ error: error.message }), {
		status: 500,
		headers: { 'Content-Type': 'application/json' },
	  });
	}
  }
