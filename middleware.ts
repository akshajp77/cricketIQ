import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const isApiAuth = nextUrl.pathname.startsWith("/api/auth");
  const isApi = nextUrl.pathname.startsWith("/api");
  const isAuth = nextUrl.pathname.startsWith("/auth");

  // Always allow auth API and auth pages
  if (isApiAuth) return NextResponse.next();

  // Check for JWT session cookie (NextAuth v5 JWT strategy)
  const sessionToken =
    req.cookies.get("authjs.session-token") ??
    req.cookies.get("__Secure-authjs.session-token") ??
    req.cookies.get("next-auth.session-token") ??
    req.cookies.get("__Secure-next-auth.session-token");

  const isLoggedIn = !!sessionToken;

  // Redirect logged-in users away from auth pages
  if (isAuth && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Allow all API routes through (they do their own auth checks)
  if (isApi) return NextResponse.next();

  // Allow auth pages for logged-out users
  if (isAuth) return NextResponse.next();

  // Protect all dashboard routes
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
