import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of allowed origins for CORS
const allowedOrigins = ['https://matilha.vercel.app'];

export function middleware(request: NextRequest) {
  const requestOrigin = request.headers.get('origin');
  const isAllowedOrigin = requestOrigin ? allowedOrigins.includes(requestOrigin) : false;

  // If it's an OPTIONS request (preflight CORS request) and the origin is allowed
  if (request.method === 'OPTIONS' && isAllowedOrigin) {
    const headers: HeadersInit = {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Accept, Origin',
      'Access-Control-Allow-Credentials': 'true',
    };

    // Only set the 'Access-Control-Allow-Origin' header if requestOrigin is not null
    if (requestOrigin) {
      headers['Access-Control-Allow-Origin'] = requestOrigin;
    }

    return new NextResponse(null, { headers });
  }

  // For non-OPTIONS requests, set the CORS headers if origin is allowed
  if (isAllowedOrigin && requestOrigin) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', requestOrigin);
    return response;
  }

  // If the origin is not allowed, proceed without setting the CORS headers
  return NextResponse.next();
}

export const config = {
  matcher: '/api/comicbooks-api', // Adjust the path to match your API routes
};
