import type { NextRequest } from 'next/server';
import { createHmac } from 'node:crypto';
import { db, hashPassword } from '@volqan/core';
import { json, badRequest, internalError } from '@/lib/api-helpers';
import { rateLimit } from '@/lib/rate-limit';

const SECRET = process.env.SESSION_SECRET ?? 'dev-session-secret';

function verifyResetToken(token: string): { userId: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return null;
    const [userId, expiresAtStr, sig] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) return null;
    const payload = `${userId}:${expiresAt}`;
    const expected = createHmac('sha256', SECRET).update(payload).digest('hex');
    if (sig !== expected) return null;
    return { userId };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';
  const rl = rateLimit(`reset-pw:${ip}`, { max: 10, windowMs: 15 * 60 * 1000 });
  if (!rl.allowed) {
    return json({ error: 'Too many requests. Please try again later.' }, 429);
  }

  let body: { token?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  if (!body.token || typeof body.token !== 'string') {
    return badRequest('token is required.');
  }
  if (!body.password || typeof body.password !== 'string' || body.password.length < 8) {
    return badRequest('password must be at least 8 characters.');
  }

  const verified = verifyResetToken(body.token);
  if (!verified) {
    return json({ error: 'Invalid or expired reset token.' }, 400);
  }

  try {
    const passwordHash = await hashPassword(body.password);
    await db.user.update({
      where: { id: verified.userId },
      data: { password: passwordHash },
    });

    return json({ ok: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('[reset-password]', err);
    return internalError();
  }
}
