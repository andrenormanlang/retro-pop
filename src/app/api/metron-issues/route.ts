import { NextRequest, NextResponse } from 'next/server';

// Helper function to format a Date object into YYYY-MM-DD string
function formatDate(date: Date): string {
    const year = date.getFullYear();
    // getMonth() is 0-indexed, so add 1
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export async function GET(request: NextRequest) {
	const authHeaderValue = process.env.METRON_API_AUTH_HEADER;

	// Check if the environment variable is set
	if (!authHeaderValue) {
		return new NextResponse("METRON_API_AUTH_HEADER environment variable is not set", { status: 401 });
	}

	// --- Calculate the date range ---
    const today = new Date(); // Get today's date

    // Calculate the date 15 days ago
    const fifteenDaysAgo = new Date(today.getTime()); // Start with today's timestamp
    fifteenDaysAgo.setDate(today.getDate() - 30); // Subtract 15 days

    // Calculate the date 15 days from now
    const fifteenDaysFromNow = new Date(today.getTime()); // Start with today's timestamp
    fifteenDaysFromNow.setDate(today.getDate() + 45); // Add 15 days

    // Format the dates into YYYY-MM-DD strings
    const startDate = formatDate(fifteenDaysAgo);
    const endDate = formatDate(fifteenDaysFromNow);
    // --- End Date Range Calculation ---

	// Use the calculated date range in the API URL
	const url = `https://metron.cloud/api/issue/?store_date_range_after=${startDate}&store_date_range_before=${endDate}`;
    console.log('Fetching data for URL:', url); // Log the generated URL for debugging

	try {
		const response = await fetch(url, {
			headers: {
				// Use the Base64 encoded value from the environment variable
				'Authorization': `Basic ${authHeaderValue}`, // Make sure this is correctly set in .env.local
				'Accept': 'application/json',
			},
            // Optional: Set a timeout for the fetch request
            // signal: AbortSignal.timeout(10000) // Requires Node.js 14.18+ or polyfill
		});

		// Check for non-OK status codes (like 401, 404, 500).
		if (!response.ok) {
            const errorText = await response.text();
            console.error(`API call failed with status: ${response.status}`, errorText);
			throw new Error(`API call failed with status: ${response.status}. Details: ${errorText}`);
		}

		const data = await response.json();

		// Check for unexpected response structure or empty results array
		if (!data || !data.results || !Array.isArray(data.results)) {
			console.error('API response did not contain a results array or unexpected structure:', data);
			return new NextResponse("Unexpected API response format", { status: 500 });
		}

        // If the results array is empty, return a 404 or empty array
		if (data.results.length === 0) {
            return new NextResponse("No comic issues found matching the date range criteria", { status: 404 });
		}

		// Return the entire array of results for the current page
		return NextResponse.json(data.results);

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during API fetch';
		console.error('Failed to fetch comic issues:', errorMessage);

        // If it was a timeout error, you might want a specific status
        // if (error instanceof Error && error.name === 'TimeoutError') {
        //      return new NextResponse(JSON.stringify({ error: `API request timed out: ${errorMessage}` }), { status: 504 });
        // }


		return new NextResponse(JSON.stringify({ error: `Internal Server Error: ${errorMessage}` }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}
}
