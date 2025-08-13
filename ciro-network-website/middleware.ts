import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/tokenomics', '/manifesto'];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (!isProtected) return NextResponse.next();

  const authCookie = request.cookies.get('siteAuth')?.value;
  if (authCookie === '1') return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = '/protected';
  url.search = `?next=${encodeURIComponent(pathname + (search || ''))}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/tokenomics/:path*', '/manifesto/:path*'],
};

