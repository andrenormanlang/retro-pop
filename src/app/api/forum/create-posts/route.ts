// src/pages/api/posts/create.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export async function POST(request: NextRequest) {
    try {
        const { userId, topicId, posts } = await request.json();

        if (!posts || !Array.isArray(posts) || posts.length === 0 || !userId || !topicId) {
            return new NextResponse("Missing required fields or posts array is empty", { status: 400 });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Insert the list of posts into the 'posts' table
        const postsWithUserAndTopic = posts.map(post => ({
            ...post,
            created_by: userId,
            topic_id: topicId
        }));

        const { data: postData, error: postError } = await supabase.from("posts").insert(postsWithUserAndTopic).select();

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
