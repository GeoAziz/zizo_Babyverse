import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Protect admin routes
    if (pathname.startsWith("/admin")) {
      if (!token || (token as any).role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }: { token: any }) => {
        return true; // Let the middleware function handle authorization
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
