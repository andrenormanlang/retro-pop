import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { "metron-issueId": string } }) {
	const authHeaderValue = process.env.METRON_API_AUTH_HEADER;

	if (!authHeaderValue) {
		return new NextResponse("METRON_API_AUTH_HEADER environment variable is not set", {
			status: 401,
		});
	}

	const issueId = params["metron-issueId"];
	const url = `https://metron.cloud/api/issue/${issueId}/`;

	try {
		const response = await fetch(url, {
			headers: {
				Authorization: `Basic ${authHeaderValue}`,
				Accept: "application/json",
			},
			cache: "no-store",
		});

		if (!response.ok) {
			// Try to parse error response
			let errorDetail = "";
			try {
				const errorJson = await response.json();
				errorDetail = errorJson.detail || "";
			} catch {
				errorDetail = await response.text();
			}

			// Pass through the Metron API status code and error message
			return new NextResponse(JSON.stringify({ error: errorDetail || "Failed to fetch issue" }), {
				status: response.status,
				headers: { "Content-Type": "application/json" },
			});
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Failed to fetch comic issue:", error);
		return new NextResponse(JSON.stringify({ error: "Failed to fetch issue data" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
