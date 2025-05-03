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
		const query = searchParams.get("series_name")?.toLowerCase();

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

		// Create params for the Metron API call
		const params = new URLSearchParams();

		// Always fetch data for the full 60-day window to get all potential results
		params.append("store_date_range_after", thirtyDaysAgo.toISOString().split("T")[0]);
		params.append("store_date_range_before", thirtyDaysAhead.toISOString().split("T")[0]);

		// Add search query if provided
		if (query) {
			params.append("series_name", query);
		}

		// Add other query parameters
		const additionalParams = [
			"publisher_name",
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

		// Fetch data from Metron API
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

		// Split results into recent and upcoming
		const recentResults = [];
		const upcomingResults = [];

		// Filter and sort results based on store_date
		data.results.forEach((issue: any) => {
			const storeDate = new Date(issue.store_date);
			storeDate.setHours(0, 0, 0, 0);

			if (storeDate >= thirtyDaysAgo && storeDate <= today) {
				recentResults.push(issue);
			} else if (storeDate > today && storeDate <= thirtyDaysAhead) {
				upcomingResults.push(issue);
			}
		});

		// Sort results chronologically
		const sortByDate = (a: any, b: any) => {
			return new Date(a.store_date).getTime() - new Date(b.store_date).getTime();
		};

		recentResults.sort(sortByDate); // Past to present
		upcomingResults.sort(sortByDate); // Near future to far future

		// Select the appropriate result set based on view
		const filteredResults = view === "recent" ? recentResults : upcomingResults;
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
			dateRange: {
				start: view === "recent" ? thirtyDaysAgo.toISOString() : today.toISOString(),
				end: view === "recent" ? today.toISOString() : thirtyDaysAhead.toISOString(),
			},
		});
	} catch (error) {
		console.error("Error fetching from Metron API:", error);
		return NextResponse.json({ error: "Failed to fetch data from Metron API" }, { status: 500 });
	}
}
