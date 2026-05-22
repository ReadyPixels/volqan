import type { NextRequest } from 'next/server';
import { db, verifyPassword, createSession, SESSION_COOKIE_NAME, AuthError } from '@volqan/core';
import { json, badRequest } from '@/lib/api-helpers';

export async function POST(request: NextRequest): Promise<Response> {
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
      select: { id: true, email: true, name: true, role: true, passwordHash: true, emailVerified: true },
    });

    if (!user || !user.passwordHash) {
      return json({ error: 'Invalid email or password.' }, 401);
    }

    const valid = await verifyPassword(password, user.passwordHash);
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
    response.headers.set(
      'Set-Cookie',
      `${SESSION_COOKIE_NAME}=${session.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`,
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
