 // pages/api/comics/index.js
import { NextRequest, NextResponse } from 'next/server';
const comicsApi = require('comicbooks-api');

export async function GET(request: NextRequest) {
	// Correctly parse URL parameters
	const urlParams = new URL(request.url).searchParams;
	const searchTerm = urlParams.get('query'); // Search term may or may not be present
	const page = parseInt(urlParams.get('page') || '1', 10); // Correct radix parameter

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

	  // Return comics data as JSON
	  return new NextResponse(JSON.stringify(comics), {
		status: 200,
		headers: {
		  'Content-Type': 'application/json',
		  'Access-Control-Allow-Origin': '*',
		},
	  });
	} catch (error) {
	  // Handle any errors that occur during the fetch
	  let errorMessage: string;
  if (error instanceof Error) {
    // It's an error object, we can safely access message or stack
    console.error('Failed to fetch comics:', error.message, error.stack);
    errorMessage = error.message;
  } else {
    // It's something else, handle accordingly
    console.error('An unexpected error occurred:', error);
    errorMessage = 'An unexpected error occurred';
  }
	  return new NextResponse(JSON.stringify({
		error: 'Failed to fetch comics',
		errorMessage : 'An unexpected error occurred',
	  }), {
		status: 500,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET',
			'Access-Control-Allow-Headers': 'Content-Type',
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
