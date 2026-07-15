import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;
  const { pathname } = request.nextUrl;

  // Protect Admin routes
  if (pathname.startsWith('/admin')) {
    // Exclude admin login route from redirection loops
    if (pathname === '/admin/login') {
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
