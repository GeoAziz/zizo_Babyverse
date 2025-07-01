import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = (request as any).nextauth?.token;

    // Admin routes protection
    if (pathname.startsWith("/admin")) {
      if (!token || token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
