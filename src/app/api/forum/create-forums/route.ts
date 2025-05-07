// src/app/api/forum/create-forums/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin-client";

export async function POST(request: NextRequest) {
	try {
		const { userId, forums } = await request.json();

		if (!userId || !forums) {
			return new NextResponse(JSON.stringify({ error: "Missing required fields" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Insert multiple forums
		const { data, error } = await supabaseAdmin.from("forums").insert(
			forums.map((forum: any) => ({
				user_id: userId,
				title: forum.title,
				description: forum.description,
			}))
		);

		if (error) throw error;

		return new NextResponse(JSON.stringify({ success: true, data }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "An unknown error occurred";
		return new NextResponse(JSON.stringify({ error: message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
