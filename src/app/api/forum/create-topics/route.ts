import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export async function POST(request: NextRequest) {
    try {
        const { userId, topics } = await request.json();

        if (!topics || !Array.isArray(topics) || topics.length === 0 || !userId) {
            return new NextResponse("Missing required fields or topics array is empty", { status: 400 });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Insert the list of topics into the 'topics' table
        const topicsWithUser = topics.map(topic => ({
            ...topic,
            created_by: userId
        }));

        const { data: topicData, error: topicError } = await supabase.from("topics").insert(topicsWithUser).select();

        if (topicError) throw topicError;

        return new NextResponse(JSON.stringify(topicData), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });
    } catch (error: any) {
        console.error("Error creating topics:", error);
        return new NextResponse(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });
    }
}
