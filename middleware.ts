import { NextResponse, NextRequest } from 'next/server';
import { rateLimit } from './lib/rate-limit';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  // Rate Limiting for API routes
  if (pathname.startsWith('/api/')) {
    // 30 requests per minute per IP for API
    if (!rateLimit(ip, 30, 60000)) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Protect Admin routes
  if (pathname.startsWith('/admin')) {
    // Exclude admin auth routes from redirection loops
    if (pathname === '/admin/login' || pathname === '/admin/register') {
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.isadmin) {
            return NextResponse.redirect(new URL('/admin', request.url));
          }
        } catch {
          // Token is malformed
        }
      }
      return NextResponse.next();
    }

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.isadmin) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Protect User dashboard routes
  const protectedUserRoutes = ['/cart', '/checkout', '/orders', '/profile', '/wallet', '/address'];
  const isProtectedUser = protectedUserRoutes.some(route => pathname.startsWith(route));

  if (isProtectedUser) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect logged-in users away from auth pages
  if (pathname === '/login' || pathname === '/register') {
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/cart/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/profile/:path*',
    '/wallet/:path*',
    '/address/:path*',
    '/login',
    '/register',
  ],
};
