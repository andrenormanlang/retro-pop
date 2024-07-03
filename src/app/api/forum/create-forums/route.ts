// src/app/api/forum/create-forums/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export async function POST(request: NextRequest) {
    try {
        const { forums, userId } = await request.json();

        if (!forums || !Array.isArray(forums) || forums.length === 0 || !userId) {
            return new NextResponse("Missing required fields or forums array is empty", { status: 400 });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Check if the user is an admin
        const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", userId)
            .single();

        if (profileError || !profileData || !profileData.is_admin) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        // Insert the list of forums into the 'forums' table
        const { data: forumData, error: forumError } = await supabase.from("forums").insert(forums).select();

        if (forumError) throw forumError;

        return new NextResponse(JSON.stringify(forumData), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });
    } catch (error: any) {
        console.error("Error creating forums:", error);
        return new NextResponse(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });
    }
}


// curl -X POST https://your-domain.com/api/forum/create-forums \
//   -H 'Content-Type: application/json' \
//   -d '{
//     {
//   "userId": "6fe22c8f-f155-48de-8d7c-0f410bbd2e50",
//   "forums": [
//     {
//       "title": "General Comic Book Discussions",
//       "description": "A place to talk about all things comic books, from your favorite series to new releases.",
//       "created_by": "6fe22c8f-f155-48de-8d7c-0f410bbd2e50"
//     },
//     {
//       "title": "Comic Book Collecting",
//       "description": "Share tips and tricks for collecting comic books, including how to preserve and store your collection.",
//       "created_by": "6fe22c8f-f155-48de-8d7c-0f410bbd2e50"
//     },
//     {
//       "title": "Comic Book Reviews",
//       "description": "Write and share reviews of the latest comic books you've read.",
//       "created_by": "6fe22c8f-f155-48de-8d7c-0f410bbd2e50"
//     },
//     {
//       "title": "Comic Book Art",
//       "description": "Discuss and share your favorite comic book art and artists.",
//       "created_by": "6fe22c8f-f155-48de-8d7c-0f410bbd2e50"
//     }
//   ]
// }

//   }'
