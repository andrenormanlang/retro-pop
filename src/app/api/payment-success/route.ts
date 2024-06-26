import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const orderId = searchParams.get("orderId");

	if (!orderId) {
		return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
	}

	// Validate the orderId as UUID
	//   const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	//   if (!uuidRegex.test(orderId)) {
	//     return NextResponse.json({ error: 'Invalid Order ID format' }, { status: 400 });
	//   }

	// Fetch the order details from the database
	const { data, error } = await supabase.from("orders").select("*").eq("id", orderId).single();

	if (error) {
		console.error("Error fetching order details:", error);
		return NextResponse.json({ error: "Order not found" }, { status: 404 });
	}

	return NextResponse.json({ order: data });
}
