import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
	throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
	throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
}

// Initialize Supabase client with service role key for admin operations
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});

export async function GET(request: NextRequest) {
	try {
		const forumId = request.nextUrl.searchParams.get("forum_id");
		if (!forumId) {
			return new NextResponse("Forum ID is required", { status: 400 });
		}

		const { data, error } = await supabaseAdmin
			.from("topics")
			.select(
				`
                *,
                profiles (
                    username,
                    avatar_url
                )
            `
			)
			.eq("forum_id", forumId);

		if (error) throw error;

		return new NextResponse(JSON.stringify(data), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
		});
	} catch (error: any) {
		console.error("Error fetching topics:", error.message);
		return new NextResponse(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
		});
	}
}
