import { NextResponse } from 'next/server';

const PASSWORD = process.env.SITE_PASSWORD || 'changeme';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    if (password !== PASSWORD) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set('siteAuth', '1', {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 12, // 12 hours
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

