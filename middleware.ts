import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

// Define public paths that don't require authentication
const publicPaths = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/confirm',
  '/auth/reset-password',
  '/auth/auth-error',
  '/api/', // Allow API routes without redirect
];

export async function middleware(request: NextRequest) {
  // Update the session
  const response = await updateSession(request);

  // Get the pathname from the URL
  const { pathname } = request.nextUrl;

  console.log(`Middleware processing path: ${pathname}`);

  // Check if the path is public or starts with any of the public paths prefixes
  const isPublicPath = publicPaths.some(path =>
    path.endsWith('/')
      ? pathname === path || pathname.startsWith(path)
      : pathname === path
  );

  console.log(`Is public path: ${isPublicPath}`);

  // If it's a public path, return the response without checking authentication
  if (isPublicPath) {
    return response;
  }

  // Extract the supabase-auth-token cookie to check if user is authenticated
  const authCookie = request.cookies.get('sb-access-token')?.value ||
                     request.cookies.get('supabase-auth-token')?.value;

  console.log(`Auth cookie present: ${!!authCookie}`);

  // If the user is not authenticated and trying to access a protected route, redirect to login
  if (!authCookie) {
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    console.log('Middleware: Redirecting to:', redirectUrl.toString(), 'from:', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except those starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (local images)
     * - public/ (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|public).*)',
  ],
};


