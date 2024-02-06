import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const CHARACTERS_API_URL = process.env.CHARACTERS_API_URL;
    if (!CHARACTERS_API_URL) {
        return new NextResponse("Characters API URL is not configured", { status: 500 });
    }

    // No need for pagination or search, so we just use the API URL directly
    try {
        const response = await fetch(CHARACTERS_API_URL);
		console.log('response', response);

        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        let data = await response.json();

        // Assuming the API returns the data in the format { status: 'success', data: [...] }
        return new NextResponse(JSON.stringify(data), {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            status: 200,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        return new NextResponse(JSON.stringify({ error: message }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });
    }
}
