import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../utils/supabase/admin-client";

export async function POST(request: Request) {
	try {
		const { comicId, isApproved } = await request.json();

		const { error } = await supabaseAdmin.from("comics-sell").update({ is_approved: isApproved }).eq("id", comicId);

		if (error) throw error;

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating comic approval status:", error);
		return NextResponse.json({ error: "Failed to update comic approval status" }, { status: 500 });
	}
}
