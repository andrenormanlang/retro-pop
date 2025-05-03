import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
	const authHeaderValue = process.env.METRON_API_AUTH_HEADER;

	if (!authHeaderValue) {
		return new NextResponse("METRON_API_AUTH_HEADER environment variable is not set", { status: 401 });
	}

	const issueId = params.id;
	const url = `https://metron.cloud/api/issue/${issueId}/`;

	try {
		const response = await fetch(url, {
			headers: {
				Authorization: `Basic ${authHeaderValue}`,
				Accept: "application/json",
			},
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`API call failed with status: ${response.status}`, errorText);
			return new NextResponse(`API call failed: ${response.status}`, { status: response.status });
		}

		const data = await response.json();

		if (!data || !data.id) {
			return new NextResponse("Invalid issue data received", { status: 500 });
		}

		return NextResponse.json(data);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
		console.error("Failed to fetch comic issue:", errorMessage);

		return new NextResponse(JSON.stringify({ error: `Internal Server Error: ${errorMessage}` }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}
}
