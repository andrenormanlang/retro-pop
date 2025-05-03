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
		
		// Ensure page and pageSize are valid numbers
		const page = pageParam && !isNaN(Number(pageParam)) ? Math.max(1, parseInt(pageParam)) : 1;
		const pageSize = pageSizeParam && !isNaN(Number(pageSizeParam)) ? Math.max(1, parseInt(pageSizeParam)) : 20;
		
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

		// If no date range is provided, set default 30-day window
		if (!storeDateRangeAfter && !storeDateRangeBefore) {
			const today = new Date();
			const thirtyDaysBefore = new Date(today);
			thirtyDaysBefore.setDate(today.getDate() - 30);
			const thirtyDaysAfter = new Date(today);
			thirtyDaysAfter.setDate(today.getDate() + 30);

			storeDateRangeAfter = thirtyDaysBefore.toISOString().split("T")[0];
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
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching from Metron API:", error);
		return NextResponse.json({ error: "Failed to fetch data from Metron API" }, { status: 500 });
	}
}
