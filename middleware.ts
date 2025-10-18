import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

import {
  AFFILIATE_COOKIE_NAME,
  AFFILIATE_COOKIE_MAX_AGE,
  normalizeReferralCode,
} from "@/lib/affiliates/constants";

const AUTH_REDIRECT_PATHS = ["/sign-in"];
const PROTECTED_PREFIXES = ["/dashboard", "/affiliate/dashboard", "/affiliate/onboarding"];

function shouldBypass(pathname: string) {
  return (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/favicon")
  );
}

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  if (shouldBypass(pathname)) {
    return NextResponse.next();
  }

  const referralParam = nextUrl.searchParams.get("ref");
  const sessionCookie = getSessionCookie(request);

  let response: NextResponse;

  if (sessionCookie && AUTH_REDIRECT_PATHS.includes(pathname)) {
    response = NextResponse.redirect(new URL("/dashboard", request.url));
  } else if (!sessionCookie) {
    const requiresAuth = PROTECTED_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix)
    );

    if (requiresAuth) {
      response = NextResponse.redirect(new URL("/sign-in", request.url));
    } else {
      response = NextResponse.next();
    }
  } else {
    response = NextResponse.next();
  }

  if (referralParam) {
    const normalized = normalizeReferralCode(referralParam);
    if (normalized.length >= 4 && normalized.length <= 24) {
      response.cookies.set({
        name: AFFILIATE_COOKIE_NAME,
        value: normalized,
        maxAge: AFFILIATE_COOKIE_MAX_AGE,
        path: "/",
        sameSite: "lax",
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
