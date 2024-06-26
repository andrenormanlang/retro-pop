import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      throw new Error("Missing orderId");
    }

    const { data, error } = await supabase
      .from("receipts")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Receipt not found");
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Internal Error:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

