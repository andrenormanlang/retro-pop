import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const SUPERHERO_ACCESS_TOKEN = process.env.SUPERHERO_ACCESS_TOKEN;
	if (!SUPERHERO_ACCESS_TOKEN) {
		return new NextResponse(
			"Superhero API access token is not configured",
			{ status: 500 }
		);
	}

	const urlParams = new URL(request.url).searchParams;
	const page = parseInt(urlParams.get("page") || "1", 10);
	const limit = parseInt(urlParams.get("limit") || "20", 10);
	const searchTerm = urlParams.get("query") || "";

	let apiUrl;
	if (searchTerm) {
		// Use the search API endpoint if a search term is provided
		apiUrl = `https://superheroapi.com/api/${SUPERHERO_ACCESS_TOKEN}/search/${encodeURIComponent(
			searchTerm
		)}`;
	} else {
		// Fetch all superheroes when there's no search term
		apiUrl = `https://akabab.github.io/superhero-api/api/all.json`;
		// apiUrl = `https://superheroapi.com/api/${SUPERHERO_ACCESS_TOKEN}/all.json`;
	}

	try {
		const response = await fetch(apiUrl);

		if (!response.ok) {
			throw new Error(`API call failed with status: ${response.status}`);
		}
		let data = await response.json();

		// Paginate data if fetching all superheroes

		// Paginate data if fetching all superheroes
		const startIndex = (page - 1) * limit;
		const endIndex = startIndex + limit;
		const paginatedData = searchTerm
			? data
			: data.slice(startIndex, endIndex);

		return new NextResponse(
			JSON.stringify({
				superheroes: paginatedData,
				currentPage: page,
				totalPages: searchTerm ? 1 : Math.ceil(data.length / limit),
				totalCount: data.length,
			}),
			{
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
				},
				status: 200,
			}
		);
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: "An unknown error occurred";
		return new NextResponse(JSON.stringify({ error: message }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
		});
	}
}
