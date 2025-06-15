
import { withAuth } from "next-auth/middleware";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req: NextRequestWithAuth) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // Protect admin routes
    if (pathname.startsWith("/admin")) {
      if (!token || (token as any).role !== "ADMIN") {
        // If you want to redirect to a specific unauthorized page for admin:
        // return NextResponse.redirect(new URL('/unauthorized-admin', req.url));
        // For now, redirect to login, which will handle it or show an error
        return NextResponse.redirect(new URL("/login?error=Unauthorized", req.url));
      }
    }
    // For other protected routes like /profile, /cart, etc.,
    // the default behavior of withAuth (redirecting to signIn page if no token) is usually sufficient.
    // `authorized` callback below handles the general case.
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // If there is a token, the user is authorized
    },
    pages: {
      signIn: "/login", // Default NextAuth sign-in page
    },
  }
);

export const config = {
  matcher: [
    "/profile/:path*",
    "/admin/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/ai-assistant/:path*", // Assuming AI assistant should be protected
    "/chatbot/:path*" // Assuming chatbot should be protected
  ],
};
