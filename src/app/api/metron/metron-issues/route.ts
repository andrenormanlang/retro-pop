import { NextResponse } from "next/server";

interface MetronIssue {
	id: number;
	series: {
		name: string;
		volume: number;
		year_began: number;
	};
	number: string;
	issue: string;
	cover_date: string;
	store_date: string | null;
	image: string;
	cover_hash: string;
	modified: string;
}

interface MetronResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: MetronIssue[];
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 5) {
	let retryCount = 0;

	while (retryCount < maxRetries) {
		try {
			const response = await fetch(url, options);

			if (response.status === 429) {
				const waitTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
				console.log(`Rate limited. Waiting ${waitTime}ms before retry ${retryCount + 1}/${maxRetries}`);
				await delay(waitTime);
				retryCount++;
				continue;
			}

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			if (retryCount === maxRetries - 1) throw error;
			retryCount++;
			await delay(1000 * Math.pow(2, retryCount));
		}
	}

	throw new Error("Max retries reached");
}

export const GET = async (request: Request) => {
	try {
		const authHeaderValue = process.env.METRON_API_AUTH_HEADER;

		if (!authHeaderValue) {
			return new NextResponse("METRON_API_AUTH_HEADER environment variable is not set", {
				status: 401,
			});
		}

		const { searchParams } = new URL(request.url);
		const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
		const pageSize = Math.max(1, Math.min(100, parseInt(searchParams.get("pageSize") || "20")));

		// Forward search parameters directly to Metron API
		const params = new URLSearchParams();
		params.set("page", page.toString());
		// Add other search parameters except pageSize which isn't supported by Metron API
		for (const [key, value] of searchParams.entries()) {
			if (key !== "pageSize" && value) {
				params.append(key, value);
			}
		}

		const data = (await fetchWithRetry(`https://metron.cloud/api/issue/?${params.toString()}`, {
			headers: {
				Authorization: `Basic ${authHeaderValue}`,
				Accept: "application/json",
			},
			cache: "no-store",
		})) as MetronResponse;

		// Calculate total pages
		const totalPages = Math.ceil(data.count / pageSize);

		return NextResponse.json({
			results: data.results,
			totalCount: data.count,
			currentPage: page,
			pageSize: pageSize,
			totalPages: totalPages,
			next: data.next ? `?page=${page + 1}&pageSize=${pageSize}` : null,
			previous: data.previous ? `?page=${page - 1}&pageSize=${pageSize}` : null,
		});
	} catch (error) {
		console.error("Error fetching from Metron API:", error);
		return NextResponse.json({ error: "Failed to fetch data from Metron API" }, { status: 500 });
	}
};
