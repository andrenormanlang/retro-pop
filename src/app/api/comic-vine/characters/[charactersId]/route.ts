import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const apiKey = process.env.COMIC_VINE_API_KEY;
    if (!apiKey) {
        return new NextResponse('API key not configured', { status: 500 });
    }

    const Id = request.nextUrl.pathname.split('/').pop();
    if (!Id) {
        return new NextResponse('Issue ID is required', { status: 400 });
    }

    const apiUrl = `https://comicvine.gamespot.com/api/character/4005-${Id}/?api_key=${apiKey}&format=json`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }

        const issueDetails = await response.json();
        return new NextResponse(JSON.stringify(issueDetails), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}
