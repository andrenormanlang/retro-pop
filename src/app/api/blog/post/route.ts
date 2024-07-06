// src/app/api/blog/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export async function POST(request: NextRequest) {
    try {
        const { userId, posts } = await request.json();

        if (!posts || !Array.isArray(posts) || posts.length === 0 || !userId) {
            return new NextResponse("Missing required fields or posts array is empty", { status: 400 });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Insert the list of posts into the 'blog_posts' table
        const postsWithUser = posts.map(post => ({
            ...post,
            author_id: userId,
        }));

        const { data: postData, error: postError } = await supabase.from("blog_posts").insert(postsWithUser).select();

        if (postError) throw postError;

        return new NextResponse(JSON.stringify(postData), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });
    } catch (error: any) {
        console.error("Error creating posts:", error);
        return new NextResponse(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });
    }
}
