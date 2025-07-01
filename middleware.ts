import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin routes protection
    if (pathname.startsWith('/admin')) {
      if (!token || (token as any).role !== 'ADMIN') {
        // Redirect to login with callback URL
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('callbackUrl', req.url);
        return NextResponse.redirect(loginUrl);
      }
    }

    // API admin routes protection
    if (pathname.startsWith('/api/admin')) {
      if (!token || (token as any).role !== 'ADMIN') {
        return new NextResponse(
          JSON.stringify({ message: 'Forbidden: Admin access required' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
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
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
};