import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from auth pages
  if (sessionCookie && ["/sign-in"].includes(pathname)) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  // Quick redirect for unauthenticated users (cookie check only)
  // Note: This only checks cookie existence, not validity
  // Actual authentication verification happens in server components
  if (!sessionCookie) {
    // Protected routes that require authentication
    const protectedPaths = ["/dashboard"];

    const isProtectedPath = protectedPaths.some((path) =>
      pathname.startsWith(path)
    );

    if (isProtectedPath) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/app-ideas/:path*",
    "/sign-in",
  ],
};
