import { NextRequest, NextResponse } from 'next/server';
import { signToken, getAdminEmail, getAdminPassword, COOKIE_NAME } from '@/lib/stub-auth';

export async function POST(req: NextRequest) {
  let email: string;
  let password: string;

  try {
    const body = await req.json();
    email = String(body.email ?? '').trim().toLowerCase();
    password = String(body.password ?? '');
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (email !== getAdminEmail().toLowerCase() || password !== getAdminPassword()) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const token = await signToken(email);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}
