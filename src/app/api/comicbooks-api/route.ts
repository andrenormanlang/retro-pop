import { NextRequest, NextResponse } from 'next/server';
const comicsApi = require('comicbooks-api');

const allowedOrigins = ['https://matilha.vercel.app', 'https://another-allowed-site.com'];

export async function middleware(request: NextRequest) {
    const requestOrigin = request.headers.get('origin');

    if (request.method === 'OPTIONS') {
        // Prepare the headers
const headers: HeadersInit = {
	'Access-Control-Allow-Methods': 'GET, OPTIONS',
	'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Accept, Origin',
	'Access-Control-Allow-Credentials': 'true',
	'Access-Control-Allow-Origin': requestOrigin ?? '',
};

        // Create the response for the preflight request
        return new NextResponse(null, { headers });
    }
}

export async function GET(request: NextRequest) {
    const urlParams = new URL(request.url).searchParams;
    const searchTerm = urlParams.get('query');
    const page = parseInt(urlParams.get('page') || '1', 10);

    try {
        let comics;
        if (searchTerm) {
            comics = await comicsApi.getComicsThroughSearch(searchTerm, page);
        } else {
            comics = await comicsApi.getLatestComics(page);
        }

        const requestOrigin = request.headers.get('origin');
        const isOriginAllowed = allowedOrigins.includes(requestOrigin ?? "");

        // Initialize headers with properties that are always set
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

		if (isOriginAllowed) {
			//@ts-ignore
		//@eslint-disable-next-line
			headers['Access-Control-Allow-Origin'] = requestOrigin;
		}


        return new NextResponse(JSON.stringify(comics), { status: 200, headers });
    } catch (error) {
        let errorMessage = 'An unexpected error occurred';
        if (error instanceof Error) {
            console.error('Failed to fetch comics:', error.message, error.stack);
            errorMessage = error.message;
        } else {
            console.error('An unexpected error occurred:', error);
        }

        // Initialize headers, conditionally adding 'Access-Control-Allow-Origin'
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        const requestOrigin = request.headers.get('origin');
        if (allowedOrigins.includes(requestOrigin ?? "")) {
			//@ts-ignore
		//@eslint-disable-next-line
            headers['Access-Control-Allow-Origin'] = requestOrigin;
        }

        return new NextResponse(JSON.stringify({
            error: 'Failed to fetch comics',
            errorMessage,
        }), {
            status: 500,
            headers,
        });
    }
}
