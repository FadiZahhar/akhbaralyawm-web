import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Negotiator from "negotiator";

const locales = ["ar", "en", "fr"] as const;
type SupportedLocale = (typeof locales)[number];
const defaultLocale: SupportedLocale = "ar";
const LOCALE_COOKIE = "NEXT_LOCALE";
// 1 year in seconds
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function isSupported(value: string | undefined): value is SupportedLocale {
  return !!value && (locales as readonly string[]).includes(value);
}

function getLocale(request: NextRequest): SupportedLocale {
  // 1) Explicit user choice via cookie wins.
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isSupported(cookieLocale)) return cookieLocale;

  // 2) Negotiate from Accept-Language.
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  const negotiated = new Negotiator({ headers }).languages(locales as unknown as string[])[0];
  return isSupported(negotiated) ? negotiated : defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip locale routing for API routes, static files, images, and special files
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".xml") ||
    pathname.endsWith(".txt") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg")
  ) {
    return;
  }

  // Check if the pathname already has a supported locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) {
    const locale = pathname.split("/")[1] as SupportedLocale;
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", locale);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });

    // Persist the chosen locale so future visits without a path prefix
    // honor the user's selection instead of re-negotiating Accept-Language.
    if (request.cookies.get(LOCALE_COOKIE)?.value !== locale) {
      response.cookies.set(LOCALE_COOKIE, locale, {
        path: "/",
        maxAge: LOCALE_COOKIE_MAX_AGE,
        sameSite: "lax",
      });
    }

    return response;
  }

  // No locale in path \u2014 prefer cookie, then Accept-Language, then default.
  const target = getLocale(request);
  request.nextUrl.pathname = `/${target}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Match all paths except _next, api, and static files
    "/((?!_next|api|favicon\\.ico|.*\\.(?:png|jpg|svg|xml|txt|ico)).*)",
  ],
};
