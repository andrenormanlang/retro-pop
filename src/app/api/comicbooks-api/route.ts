// pages/api/comics/index.ts
import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

const BASE_URL = "https://getcomics.org";
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
const CACHE_DURATION = 300000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

// Rate limiting helper
class RateLimiter {
	private lastRequest = 0;
	private minDelay = 1000; // 1 second between requests

	async throttle() {
		const now = Date.now();
		const timeSinceLastRequest = now - this.lastRequest;
		if (timeSinceLastRequest < this.minDelay) {
			await new Promise((resolve) => setTimeout(resolve, this.minDelay - timeSinceLastRequest));
		}
		this.lastRequest = Date.now();
	}
}

const rateLimiter = new RateLimiter();

// Fetch with retry logic
async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<string> {
	for (let i = 0; i < retries; i++) {
		try {
			await rateLimiter.throttle();

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
				signal: AbortSignal.timeout(30000), // 30 second timeout
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`ScraperAPI error (${response.status}): ${errorText}`);
			}

			return await response.text();
		} catch (error) {
			console.error(`Attempt ${i + 1} failed:`, error);

			if (i === retries - 1) throw error;

			// Exponential backoff
			await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * Math.pow(2, i)));
		}
	}
	throw new Error("Max retries exceeded");
}

// Get from cache or fetch
function getFromCache(key: string): any | null {
	const cached = cache.get(key);
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		console.log(`Cache hit for: ${key}`);
		return cached.data;
	}
	return null;
}

function setCache(key: string, data: any) {
	cache.set(key, { data, timestamp: Date.now() });

	// Clean old cache entries
	if (cache.size > 100) {
		const oldestKey = Array.from(cache.keys())[0];
		cache.delete(oldestKey);
	}
}

// Parse comic article with multiple selector fallbacks
function parseComicArticle($: cheerio.CheerioAPI, element: cheerio.SelectorType) {
	const $article = $(element);

	// Check if this is a blog/news post (skip these)
	const categoryLink = $article.find(".post-category").attr("href") || "";
	const isNonComic =
		categoryLink.includes("/cat/blog/") ||
		categoryLink.includes("/cat/news/") ||
		categoryLink.includes("/cat/sponsored/");

	// Title - it's in h1.post-title or h2.post-title
	const title = $article.find(".post-title a, h1.post-title a").text().trim();
	const link = $article.find(".post-title a, h1.post-title a").attr("href");

	// Image - in .post-header-image img
	const image = $article.find(".post-header-image img").attr("src");

	// Description - need to extract text content and metadata separately
	const $excerpt = $article.find(".post-excerpt");
	let description = "";
	let year = "";
	let size = "";

	// Extract year and size from the first paragraph with strong tags
	const metaParagraph = $excerpt.find("p").first().html() || "";
	const yearMatch = metaParagraph.match(/<strong>Year\s*:\s*<\/strong>\s*(\d{4})/i);
	const sizeMatch = metaParagraph.match(
		/<strong>Size\s*:\s*<\/strong>\s*([\d.]+\s*(?:GB|MB|KB)(?:\/\/[\d.]+\s*(?:GB|MB|KB))?)/i
	);

	if (yearMatch) year = yearMatch[1];
	if (sizeMatch) size = sizeMatch[1];

	// Get description from text nodes after the meta paragraph
	// Skip the first p (metadata) and get actual description text
	const descParagraphs = $excerpt.find("p").toArray();
	if (descParagraphs.length > 1) {
		// Get text from second paragraph onward
		description = descParagraphs
			.slice(1)
			.map((p) => $(p).text().trim())
			.filter((text) => text.length > 0)
			.join(" ");
	} else {
		// Fallback: get all text and remove metadata
		description = $excerpt
			.text()
			.replace(/Year\s*:\s*\d{4}/i, "")
			.replace(/Size\s*:\s*[\d.]+\s*(?:GB|MB|KB)(?:\/\/[\d.]+\s*(?:GB|MB|KB))?/i, "")
			.replace(/\|/g, "")
			.trim();
	}

	// Clean description
	if (description) {
		description = description.replace(/\s+/g, " ").trim().substring(0, 500);
	}

	// Date from post-meta
	const dateText =
		$article.find(".post-meta-date time").attr("datetime") || $article.find(".post-meta-date time").text().trim();

	// Category
	const category = $article.find(".post-category").text().trim();

	// Check if sticky (pinned post)
	const isSticky = $article.hasClass("sticky");

	return {
		title,
		link,
		image: image || "",
		description: description || "",
		date: dateText || null,
		year,
		size,
		category,
		isSticky,
		isNonComic,
	};
}

// Extract download links (basic version - not fetching individual pages)
function extractDownloadLinks($article: cheerio.Cheerio<cheerio.Element>, $: cheerio.CheerioAPI, comicUrl: string) {
	const downloadLinks: { [key: string]: string } = {};

	// GetComics typically has download links in the article body
	// But from listing pages, we usually don't get these - they're on individual pages
	$article.find("a").each((_, linkElement) => {
		const $link = $(linkElement);
		const linkHref = $link.attr("href");
		const linkText = $link.text().trim().toUpperCase();

		if (
			linkHref &&
			!linkHref.includes("#comments") &&
			!linkHref.includes("#respond") &&
			linkHref !== comicUrl &&
			!linkHref.includes("/cat/") && // Skip category links
			!linkHref.includes("/tag/") && // Skip tag links
			!linkText.includes("READ MORE") // Skip "Read More" links
		) {
			const lowerHref = linkHref.toLowerCase();

			// Detect file hosting services
			if (lowerHref.includes("mega.nz") || lowerHref.includes("mega.co.nz")) {
				downloadLinks["MEGA"] = linkHref;
			} else if (lowerHref.includes("mediafire.com")) {
				downloadLinks["MEDIAFIRE"] = linkHref;
			} else if (lowerHref.includes("getcomics.org/dlds/")) {
				downloadLinks["DOWNLOAD_NOW"] = linkHref;
			} else if (lowerHref.includes("link-to.net") || lowerHref.includes("getcomics.info")) {
				downloadLinks["DOWNLOAD_NOW"] = linkHref;
			} else if (linkText.includes("DOWNLOAD NOW") || linkText.includes("DOWNLOAD")) {
				downloadLinks["DOWNLOAD_NOW"] = linkHref;
			}
		}
	});

	return downloadLinks;
}

async function scrapeComics(searchTerm?: string, page: number = 1) {
	// Check cache first
	const cacheKey = `${searchTerm || "home"}-${page}`;
	const cached = getFromCache(cacheKey);
	if (cached) {
		return cached;
	}

	try {
		let targetUrl: string;

		if (searchTerm) {
			targetUrl = `${BASE_URL}/page/${page}/?s=${encodeURIComponent(searchTerm)}`;
		} else {
			targetUrl = page === 1 ? BASE_URL : `${BASE_URL}/page/${page}`;
		}

		console.log(`Fetching: ${targetUrl}`);

		const html = await fetchWithRetry(targetUrl);
		const $ = cheerio.load(html);

		const comics: any[] = [];

		// First, check for cover posts (featured posts at the top)
		$(".cover-blog-posts .cover-post").each((_, element) => {
			const $coverPost = $(element);
			const title = $coverPost.find(".post-title a").text().trim();
			const link = $coverPost.find(".post-title a").attr("href");
			const category = $coverPost.find(".post-category").text().trim();
			const image = $coverPost.attr("data-background-image");

			// Extract metadata from post-excerpt
			const excerptHtml = $coverPost.find(".post-excerpt").html() || "";
			const yearMatch = excerptHtml.match(/<strong>Year\s*:\s*<\/strong>\s*(\d{4})/i);
			const sizeMatch = excerptHtml.match(
				/<strong>Size\s*:\s*<\/strong>\s*([\d.]+\s*(?:GB|MB|KB)(?:\/\/[\d.]+\s*(?:GB|MB|KB))?)/i
			);

			if (title && link) {
				comics.push({
					title,
					coverPage: image || "",
					description: "", // Cover posts typically don't have descriptions on listing
					information: {
						Year: yearMatch ? yearMatch[1] : "",
						Size: sizeMatch ? sizeMatch[1] : "",
					},
					downloadLinks: {},
					url: link,
					id: link.split("/").filter(Boolean).pop() || "",
					publishDate: null,
					category,
					isSticky: true, // Cover posts are featured
					isCoverPost: true,
				});
			}
		});

		// Parse all comic articles - GetComics uses article elements with IDs like "post-380098"
		$("article[id^='post-']").each((_, element) => {
			const parsed = parseComicArticle($, element);

			// Skip blog posts, news, and non-comic content
			if (parsed.isNonComic) {
				console.log(`Skipping non-comic: ${parsed.title} (${parsed.category})`);
				return;
			}

			if (parsed.title && parsed.link) {
				const $article = $(element);
				const downloadLinks = extractDownloadLinks($article, $, parsed.link);

				comics.push({
					title: parsed.title,
					coverPage: parsed.image,
					description: parsed.description,
					information: {
						Year: parsed.year,
						Size: parsed.size,
					},
					downloadLinks,
					url: parsed.link,
					id: parsed.link.split("/").filter(Boolean).pop() || "",
					publishDate: parsed.date,
					category: parsed.category,
					isSticky: parsed.isSticky,
				});
			}
		});

		// Get pagination info
		const totalPages = $(".pagination .page-numbers").not(".next, .prev").last().text();
		const hasMore = $(".pagination .next").length > 0;

		const result = {
			results: comics,
			pagination: {
				current_page: page,
				total_pages: totalPages ? parseInt(totalPages, 10) : page,
				has_more: hasMore,
				total_results: comics.length,
			},
			success: true,
		};

		// Cache the result
		setCache(cacheKey, result);

		return result;
	} catch (error) {
		console.error("Scraping error:", error);
		throw error;
	}
}

// Separate endpoint for fetching individual comic details
// This should be called from a different route: /api/comics/[id]
export async function fetchComicDetails(comicUrl: string) {
	const cached = getFromCache(`detail-${comicUrl}`);
	if (cached) return cached;

	try {
		const html = await fetchWithRetry(comicUrl);
		const $ = cheerio.load(html);

		// Extract enhanced description
		let description = "";
		const plotParagraphs = $(".entry-content p, .post-content p")
			.filter((_, el) => {
				const text = $(el).text().trim();
				const hasLinks = $(el).find("a").length > 0;
				return text.length > 50 && !hasLinks && !text.toLowerCase().includes("download");
			})
			.map((_, el) => $(el).text().trim())
			.get();

		if (plotParagraphs.length > 0) {
			description = plotParagraphs.reduce((a, b) => (a.length > b.length ? a : b));
		}

		// Extract all download links
		const downloadLinks: { [key: string]: string } = {};
		$("a").each((_, linkElement) => {
			const $link = $(linkElement);
			const linkHref = $link.attr("href");

			if (linkHref) {
				const lowerHref = linkHref.toLowerCase();

				if (lowerHref.includes("mega.nz")) {
					downloadLinks["MEGA"] = linkHref;
				} else if (lowerHref.includes("mediafire.com")) {
					downloadLinks["MEDIAFIRE"] = linkHref;
				} else if (lowerHref.includes("rapidgator.net")) {
					downloadLinks["RAPIDGATOR"] = linkHref;
				} else if (lowerHref.includes("getcomics.org/dlds/")) {
					downloadLinks["DOWNLOAD_NOW"] = linkHref;
				}
			}
		});

		const result = {
			description: description || "",
			downloadLinks,
		};

		setCache(`detail-${comicUrl}`, result);
		return result;
	} catch (error) {
		console.error("Error fetching comic details:", error);
		throw error;
	}
}

export async function GET(request: NextRequest) {
	const urlParams = new URL(request.url).searchParams;
	const searchTerm = urlParams.get("query");
	const page = parseInt(urlParams.get("page") || "1", 10);

	console.log(`API Request - Search: ${searchTerm}, Page: ${page}`);

	// Validate page number
	if (page < 1 || page > 100) {
		return NextResponse.json({ error: "Invalid page number. Must be between 1-100" }, { status: 400 });
	}

	try {
		const data = await scrapeComics(searchTerm || undefined, page);

		return NextResponse.json(data.results, {
			headers: {
				"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
			},
		});
	} catch (error) {
		console.error("API Error:", error);

		const errorMessage = error instanceof Error ? error.message : "Unknown error";

		return NextResponse.json(
			{
				error: "Failed to fetch comics",
				message: errorMessage,
				success: false,
			},
			{ status: 500 }
		);
	}
}
