import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const apiKey = process.env.COMIC_VINE_API_KEY;
	if (!apiKey) {
		return new NextResponse("API key not configured", { status: 500 });
	}

	const urlParams = new URL(request.url).searchParams;
	const page = parseInt(urlParams.get("page") || "1", 10);
	const limit = parseInt(urlParams.get("limit") || "15", 10);
	const searchTerm = urlParams.get("query") || "";

	let apiUrl;
	if (searchTerm) {
		apiUrl = `https://comicvine.gamespot.com/api/publishers/?api_key=${apiKey}&format=json&filter=name:${encodeURIComponent(
			searchTerm
		)}&limit=${limit}&page=${page}`;
	} else {
		const offset = (page - 1) * limit;
		apiUrl = `https://www.comicvine.com/api/publishers/?api_key=${apiKey}&format=json&limit=${limit}&offset=${offset}`;
	}

	try {
		const response = await fetch(apiUrl);

		if (!response.ok) {
			throw new Error(`API call failed with status: ${response.status}`);
		}
		const issuesList = await response.json();
		return new NextResponse(JSON.stringify(issuesList), {
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
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
