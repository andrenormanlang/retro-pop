// pages/api/comics/index.js
import { NextRequest, NextResponse } from "next/server";
const comicsApi = require("comicbooks-api");

export async function GET(request: NextRequest) {
	// Correctly parse URL parameters
	const urlParams = new URL(request.url).searchParams;
	const searchTerm = urlParams.get("query"); // Search term may or may not be present
	const page = parseInt(urlParams.get("page") || "1", 10); // Correct radix parameter

	try {
		let comics;

		// Determine action based on the presence of a search term
		if (searchTerm) {
			// Search for comics using the provided term
			comics = await comicsApi.getComicsThroughSearch(searchTerm, page);
		} else {
			// Fetch the latest comics if no search term is provided
			comics = await comicsApi.getLatestComics(page);
		}

		return NextResponse.json(comics);
	} catch (error) {
		console.error("Failed to fetch comics:", error);

		return NextResponse.json(
			{
				error: "Failed to fetch comics",
				message: error instanceof Error ? error.message : "An unexpected error occurred",
			},
			{ status: 500 }
		);
	}
}
