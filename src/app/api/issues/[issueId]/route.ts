import { NextRequest, NextResponse } from "next/server";

// This function fetches the details of a specific issue by its ID from the Comic Vine API
async function getIssueById(issueId: string) {
	const apiKey = process.env.COMIC_VINE_API_KEY;
	if (!apiKey) {
		throw new Error("API key is not configured");
	}

	const url = `https://comicvine.gamespot.com/api/issue/4000-${issueId}/?api_key=${apiKey}&format=json`;
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`API call failed with status: ${response.status}`);
	}

	return response.json();
}

// This function handles the GET request made to /api/issues/[issueId]
export async function GET(request: NextRequest) {
	// Extract the issueId from the URL path
	const issueId = request.nextUrl.pathname.split("/").pop();

	try {
		if (issueId) {
			const issue = await getIssueById(issueId);
			return NextResponse.json(issue);
		} else {
			throw new Error("Issue ID is required");
		}
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: "An unknown error occurred";
		return new NextResponse(JSON.stringify({ error: message }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
		});
	}
}
