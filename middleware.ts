import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const isApiAuth = nextUrl.pathname.startsWith("/api/auth");
  const isApi = nextUrl.pathname.startsWith("/api");
  const isAuth = nextUrl.pathname.startsWith("/auth");

  // Always allow auth API and auth pages through
  if (isApiAuth || isAuth) return NextResponse.next();

  // Always allow API routes (they do their own auth checks)
  if (isApi) return NextResponse.next();

  // NextAuth v5 JWT cookie names (authjs.* not next-auth.*)
  const sessionToken =
    req.cookies.get("authjs.session-token") ??
    req.cookies.get("__Secure-authjs.session-token");

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/auth/signin", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
