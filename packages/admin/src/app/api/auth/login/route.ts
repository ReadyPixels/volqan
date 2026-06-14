import type { NextRequest } from 'next/server';
import { db, verifyPassword, createSession, SESSION_COOKIE_NAME, AuthError } from '@volqan/core';
import { json, badRequest } from '@/lib/api-helpers';
import { checkContentLength } from '@/lib/body-limit';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest): Promise<Response> {
  // Rate limit: 10 attempts per 15 minutes per IP
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';
  const rl = await rateLimit(`login:${ip}`, { max: 10, windowMs: 15 * 60 * 1000 });
  if (!rl.allowed) {
    return json(
      { error: 'Too many login attempts. Please try again later.' },
      429,
    );
  }

  const bodySizeError = checkContentLength(request);
  if (bodySizeError) return bodySizeError;

  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  const { email, password } = body;

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return badRequest('Email and password are required.');
  }

  try {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true, name: true, role: true, password: true, emailVerified: true },
    });

    if (!user || !user.password) {
      return json({ error: 'Invalid email or password.' }, 401);
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return json({ error: 'Invalid email or password.' }, 401);
    }

    const session = await createSession({
      userId: user.id,
      ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    const response = json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // Set httpOnly session cookie — 7 days
    const securePart = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    response.headers.set(
      'Set-Cookie',
      `${SESSION_COOKIE_NAME}=${session.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${securePart}`,
    );

    return response;
  } catch (err) {
    if (err instanceof AuthError) {
      return json({ error: err.message }, err.statusCode);
    }
    console.error('[auth/login]', err);
    return json({ error: 'An unexpected error occurred.' }, 500);
  }
}
