import { NextRequest, NextResponse } from 'next/server';

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
