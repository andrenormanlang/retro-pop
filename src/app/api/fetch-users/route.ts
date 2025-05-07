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
		// Fetch user profiles
		const { data: profileData, error: profileError } = await supabaseAdmin
			.from("profiles")
			.select("id, username, full_name, avatar_url");

		if (profileError) {
			console.error("Supabase profile query error:", profileError);
			throw new Error(`Supabase query failed: ${profileError.message}`);
		}

		// Fetch user emails from the authentication service
		const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();

		if (authError) {
			console.error("Supabase auth query error:", authError);
			throw new Error(`Supabase auth query failed: ${authError.message}`);
		}

		// Merge the data based on user ID
		const mergedData = profileData.map((profile) => {
			// @ts-ignore
			const authUser = authData.users.find((user) => user.id === profile.id);
			return {
				...profile,
				email: authUser ? authUser.email : null,
				created: authUser ? authUser.created_at : null,
				last_sign_in: authUser ? authUser.last_sign_in_at : null,
			};
		});

		return new NextResponse(JSON.stringify({ users: mergedData }), {
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "An unknown error occurred";
		console.error("API route error:", message);
		return new NextResponse(JSON.stringify({ error: message }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
		});
	}
}
