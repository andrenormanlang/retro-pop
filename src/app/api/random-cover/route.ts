import { NextRequest, NextResponse } from 'next/server';
import { ComicIssue, ComicIssuesResponse } from "@/types/metron.types";

export async function getRandomComicCover(){
    const authHeader = process.env.METRON_API_AUTH_HEADER;
    if (!authHeader) {
        console.error('Authorization header is not set');
        return null;
    }

    const url = 'https://metron.cloud/api/issue/';

    try {
        const response = await fetch(url, {
            headers: new Headers({
                'Authorization': `Basic ${authHeader}`,
                 'Accept': 'application/json',
            }),
        });

        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }

        const data: ComicIssuesResponse = await response.json();
        if (data.results.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * data.results.length);
        return data.results[randomIndex];
    } catch (error) {
        console.error('Failed to fetch random comic cover:', error);
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        const randomCover = await getRandomComicCover();
        return NextResponse.json(randomCover);
    } catch (error) {
        const message = (error instanceof Error) ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Be cautious with this in production
            },
        });
    }
}
