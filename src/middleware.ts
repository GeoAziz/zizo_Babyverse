import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath =
    path.startsWith("/api/products") ||
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/about") ||
    path === "/";

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect to login if accessing protected route without token
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Matcher configuration for protected routes
export const config = {
  matcher: [
    "/profile/:path*",
    "/admin/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/ai-assistant/:path*",
    "/chatbot/:path*",
    "/api/((?!products).)*", // Exclude /api/products from authentication
  ],
};
