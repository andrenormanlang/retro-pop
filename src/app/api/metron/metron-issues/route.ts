import { NextResponse } from "next/server";

async function getAllResults(params: URLSearchParams, authHeaderValue: string) {
	let allResults = [];
	let page = 1;
	let hasMore = true;

	while (hasMore) {
		const currentParams = new URLSearchParams(params);
		currentParams.set("page", page.toString());

		const response = await fetch(`https://metron.cloud/api/issue/?${currentParams.toString()}`, {
			headers: {
				Authorization: `Basic ${authHeaderValue}`,
				Accept: "application/json",
			},
			cache: "no-store",
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		allResults = [...allResults, ...data.results];
		hasMore = data.next !== null;
		page++;
	}

	return allResults;
}

export async function GET(request: Request) {
	try {
		const authHeaderValue = process.env.METRON_API_AUTH_HEADER;

		if (!authHeaderValue) {
			return new NextResponse("METRON_API_AUTH_HEADER environment variable is not set", {
				status: 401,
			});
		}

		const { searchParams } = new URL(request.url);
		const pageParam = searchParams.get("page");
		const pageSizeParam = searchParams.get("pageSize");
		const view = searchParams.get("view") || "recent";

		// Ensure page and pageSize are valid numbers
		const page = pageParam && !isNaN(Number(pageParam)) ? Math.max(1, parseInt(pageParam)) : 1;
		const pageSize = pageSizeParam && !isNaN(Number(pageSizeParam)) ? Math.max(1, parseInt(pageSizeParam)) : 20;



		// Create base params for the API call
		const params = new URLSearchParams();

		// Add search parameters
		for (const [key, value] of searchParams.entries()) {
			if (key !== "page" && key !== "pageSize" && key !== "view" && value) {
				params.append(key, value);
			}
		}

		// Fetch all results from all pages
		const allResults = await getAllResults(params, authHeaderValue);

		// Split and filter results based on date
		const recentResults = [];
		const upcomingResults = [];

		allResults.forEach((issue: any) => {
			const storeDate = new Date(issue.store_date);
			storeDate.setHours(0, 0, 0, 0);

		});

		// Sort results chronologically
		const sortByDate = (a: any, b: any) => {
			return new Date(a.store_date).getTime() - new Date(b.store_date).getTime();
		};

		recentResults.sort(sortByDate);
		upcomingResults.sort(sortByDate);

		// Get the appropriate result set based on view
		const filteredResults = view === "recent" ? recentResults : upcomingResults;
		const totalFilteredCount = filteredResults.length;

		// Apply pagination to filtered results
		const startIndex = (page - 1) * pageSize;
		const paginatedResults = filteredResults.slice(startIndex, startIndex + pageSize);
		const totalPages = Math.ceil(totalFilteredCount / pageSize);

		// Return response with correct counts and paginated results
		return NextResponse.json({
			results: paginatedResults,
			count: totalFilteredCount,
			totalCount: allResults.length,
			recentCount: recentResults.length,
			upcomingCount: upcomingResults.length,
			totalPages: totalPages,
			currentPage: page,
			pageSize: pageSize,
			next: page * pageSize < totalFilteredCount ? `?page=${page + 1}` : null,
			previous: page > 1 ? `?page=${page - 1}` : null,
			view: view,
		});
	} catch (error) {
		console.error("Error fetching from Metron API:", error);
		return NextResponse.json({ error: "Failed to fetch data from Metron API" }, { status: 500 });
	}
}
