import { NextResponse } from "next/server";

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

		// Get the current date for filtering
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// Calculate date ranges
		const thirtyDaysAgo = new Date(today);
		thirtyDaysAgo.setDate(today.getDate() - 30);

		const thirtyDaysAhead = new Date(today);
		thirtyDaysAhead.setDate(today.getDate() + 30);

		// Set date range based on view type
		const params = new URLSearchParams();

		// Set the date range based on the view
		if (view === "recent") {
			params.append("store_date_range_after", thirtyDaysAgo.toISOString().split("T")[0]);
			params.append("store_date_range_before", today.toISOString().split("T")[0]);
		} else {
			params.append("store_date_range_after", today.toISOString().split("T")[0]);
			params.append("store_date_range_before", thirtyDaysAhead.toISOString().split("T")[0]);
		}

		params.append("page", "1"); // Get all results in one call
		params.append("page_size", "1000"); // Use a large page size to get all results

		// Add other query parameters
		const additionalParams = [
			"publisher_name",
			"series_name",
			"cover_month",
			"cover_year",
			"cv_id",
			"gcd_id",
			"imprint_id",
			"imprint_name",
			"rating",
			"sku",
			"upc",
		];

		for (const param of additionalParams) {
			const value = searchParams.get(param);
			if (value) params.append(param, value);
		}

		// Fetch main data
		const response = await fetch(`https://metron.cloud/api/issue/?${params.toString()}`, {
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

		// Filter results based on exact date ranges
		let filteredResults = data.results.filter((issue: any) => {
			const issueDate = new Date(issue.store_date);
			issueDate.setHours(0, 0, 0, 0);

			if (view === "recent") {
				return issueDate >= thirtyDaysAgo && issueDate <= today;
			} else {
				return issueDate > today && issueDate <= thirtyDaysAhead;
			}
		});

		// Sort results with different logic for recent and upcoming
		filteredResults.sort((a: any, b: any) => {
			const dateA = new Date(a.store_date).getTime();
			const dateB = new Date(b.store_date).getTime();
			// Recent: oldest to newest (ascending)
			// Upcoming: nearest future to furthest future (ascending)
			return dateA - dateB;
		});

		// Calculate total filtered count (before pagination)
		const totalFilteredCount = filteredResults.length;

		// Apply pagination
		const startIndex = (page - 1) * pageSize;
		const paginatedResults = filteredResults.slice(startIndex, startIndex + pageSize);

		// Return response with correct counts and paginated results
		return NextResponse.json({
			results: paginatedResults,
			count: totalFilteredCount,
			totalPages: Math.ceil(totalFilteredCount / pageSize),
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
