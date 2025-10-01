// pages/api/comics/index.js
import { NextRequest, NextResponse } from "next/server";
const comicsApi = require("comicbooks-api");

export async function GET(request: NextRequest) {
	// Correctly parse URL parameters
	const urlParams = new URL(request.url).searchParams;
	const searchTerm = urlParams.get("query"); // Search term may or may not be present
	const page = parseInt(urlParams.get("page") || "1", 10); // Correct radix parameter
	const pageSize = parseInt(urlParams.get("pageSize") || "10", 10);

	// Add detailed logging for debugging production issues
	console.log("ComicsAPI Request:", {
		searchTerm,
		page,
		pageSize,
		nodeEnv: process.env.NODE_ENV,
		timestamp: new Date().toISOString(),
		userAgent: request.headers.get("user-agent"),
		origin: request.headers.get("origin"),
		referer: request.headers.get("referer"),
	});

	try {
		let comics;

		// Add timeout for external API calls
		const timeoutPromise = new Promise((_, reject) => {
			setTimeout(() => reject(new Error("Request timeout after 15 seconds")), 15000);
		});

		// Determine action based on the presence of a search term
		if (searchTerm) {
			console.log(`Searching for comics with term: "${searchTerm}", page: ${page}`);
			// Search for comics using the provided term
			comics = await Promise.race([comicsApi.getComicsThroughSearch(searchTerm, page), timeoutPromise]);
		} else {
			console.log(`Fetching latest comics, page: ${page}`);
			// Fetch the latest comics if no search term is provided
			comics = await Promise.race([comicsApi.getLatestComics(page), timeoutPromise]);
		}

		console.log("ComicsAPI Success:", {
			resultsCount: comics?.length || 0,
			hasData: !!comics,
			timestamp: new Date().toISOString(),
		});

		return NextResponse.json(comics);
	} catch (error) {
		// Enhanced error logging for production debugging
		console.error("ComicsAPI Error Details:", {
			error: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
			searchTerm,
			page,
			pageSize,
			nodeEnv: process.env.NODE_ENV,
			timestamp: new Date().toISOString(),
			errorType: error?.constructor?.name,
			// Add any additional error properties
			...(error &&
				typeof error === "object" &&
				error.response && {
					statusCode: error.response?.status,
					statusText: error.response?.statusText,
					responseData: error.response?.data,
				}),
		});

		// Return more detailed error information in development
		const errorResponse = {
			error: "Failed to fetch comics",
			message: error instanceof Error ? error.message : "An unexpected error occurred",
			...(process.env.NODE_ENV === "development" && {
				stack: error instanceof Error ? error.stack : undefined,
				details: {
					searchTerm,
					page,
					pageSize,
					timestamp: new Date().toISOString(),
				},
			}),
		};

		return NextResponse.json(errorResponse, {
			status: error?.response?.status === 403 ? 403 : 500,
			headers: {
				"Cache-Control": "no-cache, no-store, must-revalidate",
				Pragma: "no-cache",
				Expires: "0",
			},
		});
	}
}

// pages/api/comics/index.js

// import { ComicBooksAPI, ComicDownloadLinks } from "@/types/cbAPI.types";
// import axios from "axios";
// import { load } from "cheerio";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(request: NextRequest) {
// 	const urlParams = new URL(request.url).searchParams;
// 	const searchTerm = urlParams.get("query");
// 	const page = parseInt(urlParams.get("page") || "1", 10);

// 	try {
// 		const baseURL = `https://getcomics.org`;
// 		const searchURL = searchTerm ? `/search/${searchTerm}/page/${page}` : `/page/${page}`;
// 		const fullURL = `${baseURL}${searchURL}`;

// 		// Include a User-Agent header to mimic a request from a popular web browser
//         const response = await axios.get(fullURL, {
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121 Safari/537.3'
//             }
//         });
//         const $ = load(response.data);

// 		const comics: ComicBooksAPI[] = [];

// 		$(".post").each((index, element) => {
// 			const title = $(element).find("h1.post-title").text().trim();
// 			const coverPage = $(element).find(".post-header-image img").attr("src") || "";
// 			const postInfoChildren = $(element).find("div.post-info").contents();
// 			let description = "";
// 			postInfoChildren.each((i, el) => {
// 				if (el.type === "text" && el.data.trim().length > 0) {
// 					description += el.data.trim() + " ";
// 				}
// 			});
// 			const hasDiscordLink = $(element).find('a[href="https://getcomics.org/news/discord-channel/"]').length > 0;

// 			// If it's the Discord card, skip this iteration
// 			if (hasDiscordLink) {
// 				return; // Skip this element and move to the next one
// 			}
// 			// Extract the full text, then split and use only the part before 'Year :'
// 			const fullText = $(element).find("div.post-info").text();
// 			description = description.trim();

// 			// Use regex to find year and size within the text
// 			const yearMatch = fullText.match(/Year\s*:\s*(\d{4})/);
// 			const sizeMatch = fullText.match(/Size\s*:\s*([\d.]+\s*MB)/);
// 			const year = yearMatch ? yearMatch[1] : ""; // Provide an empty string as fallback
// 			const size = sizeMatch ? sizeMatch[1] : ""; // Provide an empty string as fallback

// 			// Handle the download links similarly to before
// 			// Handle the download links similarly to before
// 			const downloadLinks: ComicDownloadLinks = {};
// 			$(element)
// 				.find(".post-meta a")
// 				.each((_, linkElem) => {
// 					const linkHref = $(linkElem).attr("href");
// 					if (linkHref) {
// 						const linkText = $(linkElem).text().trim().toUpperCase().replace(/\s+/g, "_");
// 						downloadLinks[linkText] = linkHref;
// 					}
// 				});

// 			comics.push({
// 				title,
// 				coverPage,
// 				description,
// 				information: { Year: year, Size: size },
// 				downloadLinks,
// 			});
// 		});

// 		// Return scraped comics data as JSON
// 		return new NextResponse(JSON.stringify(comics), {
// 			status: 200,
// 			headers: {
// 				"Content-Type": "application/json",
// 				"Access-Control-Allow-Origin": "*",
// 			},
// 		});
// 	} catch (error) {
// 		if (error instanceof Error) {
// 			console.error("Failed to fetch comics:", error.message);
// 			return new NextResponse(
// 				JSON.stringify({
// 					error: "Failed to fetch comics",
// 					message: error.message,
// 				}),
// 				{
// 					status: 500,
// 					headers: {
// 						"Content-Type": "application/json",
// 						"Access-Control-Allow-Origin": "*",
// 					},
// 				}
// 			);
// 		} else {
// 			console.error("An unexpected error occurred:", error);
// 			return new NextResponse(
// 				JSON.stringify({
// 					error: "Failed to fetch comics",
// 					message: "An unexpected error occurred",
// 				}),
// 				{
// 					status: 500,
// 					headers: {
// 						"Content-Type": "application/json",
// 						"Access-Control-Allow-Origin": "*",
// 					},
// 				}
// 			);
// 		}
// 	}
// }
