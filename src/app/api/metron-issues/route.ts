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

		let storeDateRangeAfter = searchParams.get("store_date_range_after");
		let storeDateRangeBefore = searchParams.get("store_date_range_before");
		const publisherName = searchParams.get("publisher_name");
		const seriesName = searchParams.get("series_name");
		const coverMonth = searchParams.get("cover_month");
		const coverYear = searchParams.get("cover_year");
		const cvId = searchParams.get("cv_id");
		const gcdId = searchParams.get("gcd_id");
		const imprintId = searchParams.get("imprint_id");
		const imprintName = searchParams.get("imprint_name");
		const rating = searchParams.get("rating");
		const sku = searchParams.get("sku");
		const upc = searchParams.get("upc");

		 // Set date range based on view type
		if (view === "recent") {
			const thirtyDaysBefore = new Date(today);
			thirtyDaysBefore.setDate(today.getDate() - 30);
			storeDateRangeBefore = today.toISOString().split("T")[0];
			storeDateRangeAfter = thirtyDaysBefore.toISOString().split("T")[0];
		} else {
			const thirtyDaysAfter = new Date(today);
			thirtyDaysAfter.setDate(today.getDate() + 30);
			storeDateRangeAfter = today.toISOString().split("T")[0];
			storeDateRangeBefore = thirtyDaysAfter.toISOString().split("T")[0];
		}

		const params = new URLSearchParams();
		params.append("page", page.toString());

		if (storeDateRangeAfter) params.append("store_date_range_after", storeDateRangeAfter);
		if (storeDateRangeBefore) params.append("store_date_range_before", storeDateRangeBefore);
		if (publisherName) params.append("publisher_name", publisherName);
		if (seriesName) params.append("series_name", seriesName);
		if (coverMonth) params.append("cover_month", coverMonth);
		if (coverYear) params.append("cover_year", coverYear);
		if (cvId) params.append("cv_id", cvId);
		if (gcdId) params.append("gcd_id", gcdId);
		if (imprintId) params.append("imprint_id", imprintId);
		if (imprintName) params.append("imprint_name", imprintName);
		if (rating) params.append("rating", rating);
		if (sku) params.append("sku", sku);
		if (upc) params.append("upc", upc);

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

		// Calculate total counts for recent and upcoming releases
		const recentCount = data.results.filter(
			(issue: any) => new Date(issue.store_date) <= today
		).length;

		const upcomingCount = data.results.filter(
			(issue: any) => new Date(issue.store_date) > today
		).length;

		// Filter results based on view type
		const filteredResults = data.results.filter((issue: any) => {
			const issueDate = new Date(issue.store_date);
			return view === "recent" 
				? issueDate <= today 
				: issueDate > today;
		});

		// Add the counts to the response
		return NextResponse.json({
			...data,
			results: filteredResults,
			recentCount,
			upcomingCount,
			totalRecentCount: data.count * (recentCount / data.results.length),
			totalUpcomingCount: data.count * (upcomingCount / data.results.length)
		});
	} catch (error) {
		console.error("Error fetching from Metron API:", error);
		return NextResponse.json({ error: "Failed to fetch data from Metron API" }, { status: 500 });
	}
}
