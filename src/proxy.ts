import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that are public (no auth required)
const PUBLIC_PATHS = [
  '/login',
  '/forgot-password',
  '/verify',
  '/reset-password',
  '/password-updated',
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all public auth routes through
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow Next.js internals and static assets through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/logo') ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    // Store where they were going so we can redirect back after login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
