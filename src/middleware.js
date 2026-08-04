import { NextResponse } from 'next/server';

export function middleware(request) {
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // If no tokens at all and trying to access the app, the client-side
  // auth check will handle showing the login form.
  // This middleware provides an additional server-side layer.

  // For API routes, let them pass through
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // For static assets and Next.js internals, let them pass
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/favicon') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // If neither token exists, the page will render and client-side
  // auth check will show the login form
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
