import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_SERVICE_ROLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY as string;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function GET(request: NextRequest) {
    try {
        const forumId = request.nextUrl.searchParams.get('forum_id');
        if (!forumId) {
            return new NextResponse("Forum ID is required", { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('topics')
            .select(`
                *,
                profiles (
                    username,
                    avatar_url
                )
            `)
            .eq('forum_id', forumId);

        if (error) throw error;
		// console.log(data);
		console.log(data);

        return new NextResponse(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error: any) {
        console.error('Error fetching topics:', error.message);
        return new NextResponse(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}
