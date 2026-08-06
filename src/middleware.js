import { NextResponse } from 'next/server';

/**
 * Next.js Edge Middleware for Admin Dashboard Route Protection
 * Protects all /dashboard/* and /admin/* routes.
 * Supports HttpOnly access_token and refresh_token cookies set by Express backend.
 */
export function middleware(request) {
  const { pathname, search } = request.nextUrl;

  // Retrieve authentication tokens set in HttpOnly cookies by the backend
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // User is considered authenticated if either access_token or refresh_token is present
  const isAuthenticated = Boolean(accessToken || refreshToken);

  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
  const isLoginRoute = pathname === '/login';
  const isRootRoute = pathname === '/';

  // Case 1: Unauthenticated user accessing protected /dashboard/* or /admin/* -> Redirect to /login
  if (isDashboardRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  // Case 2: Authenticated user visiting /login -> Redirect to /dashboard
  if (isLoginRoute && isAuthenticated) {
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
    const targetUrl = callbackUrl && (callbackUrl.startsWith('/dashboard') || callbackUrl.startsWith('/admin'))
      ? callbackUrl
      : '/dashboard';
    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  // Case 3: Root path / -> Redirect based on authentication status
  if (isRootRoute) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard',
    '/dashboard/:path*',
    '/admin',
    '/admin/:path*',
  ],
};
