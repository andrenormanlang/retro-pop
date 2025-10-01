// pages/api/comics/index.ts
import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

const BASE_URL = "https://getcomics.org";
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

// Function to fetch HTML from any URL using ScraperAPI
async function fetchHtmlWithScraperAPI(url: string): Promise<string> {
	if (!SCRAPER_API_KEY) {
		throw new Error("SCRAPER_API_KEY is not configured");
	}

	const scraperApiUrl = `https://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(
		url
	)}&render=false`;

	const response = await fetch(scraperApiUrl, {
		method: "GET",
		headers: {
			Accept: "text/html",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`ScraperAPI error (${response.status}): ${errorText}`);
	}

	return await response.text();
}

// Extract information from scraped info string
function infoScraper(str: string) {
	if (str.length !== 0) {
		const infoString = str.split(",").map((x) => x.split(":"));

		const info: any = {};
		for (let i in infoString) {
			if (infoString[i].length >= 2) {
				info[infoString[i][0].replace(/'/g, "").trim().split(" ").join("")] = infoString[i][1]
					.replace(/'/g, "")
					.trim();
			}
		}
		return info;
	}
	return {};
}

// Scrape individual comic page for detailed information
async function scrapeComicDetails(url: string) {
	try {
		console.log(`Scraping individual page: ${url}`);
		const html = await fetchHtmlWithScraperAPI(url);
		const $ = cheerio.load(html);

		// Extract title - prefer the first h1 or main title
		let title =
			$(".post-info h1, .entry-header h1, .post-title, h1.entry-title").text().trim() ||
			$(".post-title a").text().trim() ||
			$("h1").first().text().trim();

		// Clean up title - sometimes it contains extra elements or multiple titles
		if (title) {
			// Split by common separators and take the first meaningful part
			const titleParts = title.split(/(?:\s{2,}|\n|\t)/);
			if (titleParts.length > 1) {
				// Take the first part if it looks like a proper comic title
				const firstPart = titleParts[0].trim();
				if (firstPart.length > 10 && firstPart.includes("#")) {
					title = firstPart;
				}
			}

			// Remove extra whitespace and limit length
			title = title.replace(/\s+/g, " ").trim().substring(0, 100);
		}

		// Extract description - look for the first substantial paragraph
		let description = "";
		$(".post-content p, .entry-content p, .post-contents p").each((_, el) => {
			const $el = $(el);
			// Remove child elements (links, etc.) and get pure text
			const text = $el.clone().children().remove().end().text().trim();
			if (
				text.length > 50 &&
				!text.toLowerCase().includes("download") &&
				!text.toLowerCase().includes("year:") &&
				!text.toLowerCase().includes("size:") &&
				!description
			) {
				description = text;
			}
		});

		// Extract metadata information - look for patterns like "Year: 2025, Size: 100MB"
		let scrapedInfo = "";
		$(".post-content, .entry-content, .post-contents")
			.find("p, strong")
			.each((_, el) => {
				const text = $(el).text();
				if ((text.includes("Year:") || text.includes("Size:")) && text.includes("|")) {
					scrapedInfo = text;
					return false; // break
				}
			});

		// Also try to extract year and size directly
		const pageText = $(".post-content, .entry-content").text();
		const yearMatch = pageText.match(/Year\s*:\s*(\d{4})/i);
		const sizeMatch = pageText.match(/Size\s*:\s*([\d.]+\s*(?:GB|MB|KB))/i);

		// Parse the scraped info or create from individual matches
		let information: any = {};
		if (scrapedInfo) {
			information = infoScraper(scrapedInfo);
		}

		// Fill in missing info from direct matches
		if (yearMatch && !information.Year) {
			information.Year = yearMatch[1];
		}
		if (sizeMatch && !information.Size) {
			information.Size = sizeMatch[1];
		}

		// Extract download links
		const downloadLinks: { [key: string]: string } = {};

		// Look for download links in various selectors
		$("a").each((_, linkEl) => {
			const $link = $(linkEl);
			const href = $link.attr("href");
			const text = $link.text().trim();

			if (href && !href.includes("#comments") && !href.includes("/how-to-download")) {
				const lowerHref = href.toLowerCase();
				const upperText = text.toUpperCase();

				// Detect file hosting services
				if (lowerHref.includes("mega.nz") || lowerHref.includes("mega.co.nz")) {
					downloadLinks["MEGA"] = href;
				} else if (lowerHref.includes("mediafire.com")) {
					downloadLinks["MEDIAFIRE"] = href;
				} else if (lowerHref.includes("rapidgator.net")) {
					downloadLinks["RAPIDGATOR"] = href;
				} else if (lowerHref.includes("zippyshare.com")) {
					downloadLinks["ZIPPYSHARE"] = href;
				} else if (lowerHref.includes("getcomics.org/dlds/")) {
					downloadLinks["DOWNLOAD_NOW"] = href;
				} else if (
					upperText.includes("DOWNLOAD NOW") ||
					(upperText.includes("DOWNLOAD") && !upperText.includes("HOW TO"))
				) {
					if (!lowerHref.includes("how-to") && !downloadLinks["DOWNLOAD_NOW"]) {
						downloadLinks["DOWNLOAD_NOW"] = href;
					}
				} else if (upperText.includes("READ ONLINE")) {
					downloadLinks["READ_ONLINE"] = href;
				}
			}
		});

		console.log(
			`Scraped ${url}: title="${title}", desc length=${description.length}, links=${
				Object.keys(downloadLinks).length
			}`
		);

		return {
			title,
			description: description || "",
			information,
			downloadLinks,
		};
	} catch (error) {
		console.error(`Error scraping ${url}:`, error);
		return null;
	}
}

async function scrapeWithScraperAPI(searchTerm?: string, page: number = 1) {
	if (!SCRAPER_API_KEY) {
		throw new Error("SCRAPER_API_KEY is not configured");
	}

	try {
		let targetUrl: string;

		if (searchTerm) {
			targetUrl = `${BASE_URL}/page/${page}/?s=${encodeURIComponent(searchTerm)}`;
		} else {
			targetUrl = page === 1 ? BASE_URL : `${BASE_URL}/page/${page}`;
		}

		console.log(`Scraping listing page: ${targetUrl}`);

		const html = await fetchHtmlWithScraperAPI(targetUrl);
		const $ = cheerio.load(html);

		const comicPromises: Promise<any>[] = [];

		// Parse listing page - look for individual comic articles only
		$('article[id*="post-"]').each((_, element) => {
			const $article = $(element);

			// Get basic info from listing
			const coverPage = $article.find("img").attr("src") || $article.find(".post-header-image img").attr("src");
			const href = $article.find("a").first().attr("href") || $article.find(".post-title a").attr("href");
			const title = $article.find(".post-title a, h2 a, h1 a").text().trim();

			// Check if this is a valid individual comic (not a collection/bundle)
			const hasContent = $article.find(".post-info, .post-excerpt, .entry-summary").text().trim();
			const isNotBlog = !href?.includes("/blog/") && !href?.includes("/news/");

			// Filter out collections/bundles - these usually have very long titles or multiple (#) symbols
			const isIndividualComic =
				title &&
				!title.toLowerCase().includes("collection") &&
				!title.toLowerCase().includes("bundle") &&
				!title.toLowerCase().includes("pack") &&
				(title.match(/#/g) || []).length <= 2 && // Allow max 2 # symbols (for issue numbers)
				title.length < 150; // Reasonable title length for individual comics

			if (href && hasContent && coverPage && isNotBlog && isIndividualComic) {
				console.log(`Found individual comic: ${title} - ${href}`);

				// Create promise to fetch detailed info from individual page
				const promise = scrapeComicDetails(href).then((details) => {
					if (details) {
						// Additional filtering: make sure the scraped title is reasonable
						const scrapedTitle = details.title;
						const isValidTitle =
							(scrapedTitle && scrapedTitle.length < 200 && !scrapedTitle.includes("(2022)")) ||
							!scrapedTitle.includes("(2023)") ||
							!scrapedTitle.includes("(2024)") ||
							!scrapedTitle.includes("(2025)");

						// If scraped title seems like multiple comics, use the original listing title
						const finalTitle = (scrapedTitle.match(/\d{4}\)/g) || []).length > 2 ? title : scrapedTitle;

						return {
							title: finalTitle,
							coverPage: coverPage || "",
							description: details.description,
							information: details.information,
							downloadLinks: details.downloadLinks,
							url: href,
							id: href.split("/").filter(Boolean).pop() || "",
							publishDate: null,
							categories: [],
						};
					}
					return null;
				});

				comicPromises.push(promise);
			}
		});

		// Limit to first 8 comics to avoid timeout
		const limitedPromises = comicPromises.slice(0, 8);

		console.log(`Found ${comicPromises.length} comics, processing first ${limitedPromises.length}`);

		// Wait for all comic details to be scraped
		const comics = await Promise.all(limitedPromises);

		// Filter out null results
		const validComics = comics.filter((comic) => comic !== null);

		console.log(`Successfully processed ${validComics.length} comics`);

		// Get pagination info
		const totalPages = $(".pagination .page-numbers").not(".next, .prev").last().text();
		const hasMore = $(".pagination .next").length > 0;

		return {
			results: validComics,
			pagination: {
				current_page: page,
				total_pages: totalPages ? parseInt(totalPages, 10) : page,
				has_more: hasMore,
				total_results: validComics.length,
			},
			success: true,
		};
	} catch (error) {
		console.error("Scraping error:", error);
		throw error;
	}
}

export async function GET(request: NextRequest) {
	const urlParams = new URL(request.url).searchParams;
	const searchTerm = urlParams.get("query");
	const page = parseInt(urlParams.get("page") || "1", 10);

	console.log(`API Request - Search: ${searchTerm}, Page: ${page}`);
	console.log(`Environment check - SCRAPER_API_KEY exists: ${!!process.env.SCRAPER_API_KEY}`);

	// Validate page number
	if (page < 1) {
		return NextResponse.json({ error: "Invalid page number. Must be >= 1" }, { status: 400 });
	}

	try {
		const data = await scrapeWithScraperAPI(searchTerm || undefined, page);

		// Return just the comics array to match the expected format
		return NextResponse.json(data.results, {
			headers: {
				"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
			},
		});
	} catch (error) {
		console.error("API Error Details:", {
			error: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
			type: error?.constructor?.name,
			searchTerm,
			page,
		});

		const errorMessage = error instanceof Error ? error.message : "Unknown error";

		return NextResponse.json(
			{
				error: "Failed to fetch comics",
				message: errorMessage,
				success: false,
				debug: {
					searchTerm,
					page,
					timestamp: new Date().toISOString(),
					apiKeyConfigured: !!process.env.SCRAPER_API_KEY,
				},
			},
			{ status: 500 }
		);
	}
}
