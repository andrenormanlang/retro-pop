// import { type NextRequest } from "next/server";
// import { updateSession } from "@/utils/supabase/middleware";

// export async function middleware(request: NextRequest) {
//   return await updateSession(request);
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except:
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
//      * Feel free to modify this pattern to include more paths.
//      */
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//   ],
// };

import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const publicUrls = ['/reset'];

  if (publicUrls.includes(req.nextUrl.pathname)) {
    return res;
  }

  const supabase = createMiddlewareClient({ req, res });

  const {
    data: {
      session
    }
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.rewrite(new URL('/login', req.url))
  }

  return res
};

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
