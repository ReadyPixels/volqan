import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, verifyToken } from '@/lib/stub-auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ email: null }, { status: 401 });

  const email = await verifyToken(token);
  if (!email) return NextResponse.json({ email: null }, { status: 401 });

  const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return NextResponse.json({ email, name });
}
