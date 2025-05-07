import { NextRequest, NextResponse } from "next/server";
import { createClient, User } from "@supabase/supabase-js";

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

interface Profile {
	id: string;
	username: string | null;
}

interface Receipt {
	profiles: Profile;
	[key: string]: any;
}

interface AuthResponse {
	users: User[];
}

export async function GET(request: NextRequest) {
	try {
		// Fetch receipts with user profiles
		const { data: receiptsData, error: receiptsError } = await supabaseAdmin.from("receipts").select(`
            *,
            profiles:profiles (id, username)
        `);

		if (receiptsError) {
			console.error("Supabase receipts query error:", receiptsError);
			throw new Error(`Supabase query failed: ${receiptsError.message}`);
		}

		// Fetch user emails from the authentication service
		const { data: authData, error: authError } = (await supabaseAdmin.auth.admin.listUsers()) as {
			data: AuthResponse;
			error: Error | null;
		};

		if (authError) {
			console.error("Supabase auth query error:", authError);
			throw new Error(`Supabase auth query failed: ${authError.message}`);
		}

		// Merge the data based on user ID
		const mergedData = (receiptsData as Receipt[]).map((receipt) => {
			const profile = receipt.profiles;
			const authUser = authData.users.find((user) => user.id === profile.id);

			return {
				...receipt,
				profiles: {
					...profile,
					email: authUser ? authUser.email : null,
				},
			};
		});

		return new NextResponse(JSON.stringify(mergedData), {
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
