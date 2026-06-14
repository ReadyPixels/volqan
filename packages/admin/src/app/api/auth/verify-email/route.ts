import type { NextRequest } from 'next/server';
import { createHmac } from 'node:crypto';
import { db } from '@volqan/core';
import { json, badRequest, internalError } from '@/lib/api-helpers';
import { checkContentLength } from '@/lib/body-limit';

import { getRequiredSessionSecret } from '@/lib/session-secret';

const SECRET = getRequiredSessionSecret();

/** Creates a signed email verification token valid for 24 hours. */
export function createVerifyToken(userId: string): string {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  const payload = `verify:${userId}:${expiresAt}`;
  const sig = createHmac('sha256', SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 4 || parts[0] !== 'verify') return null;
    const [, userId, expiresAtStr, sig] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) return null;
    const payload = `verify:${userId}:${expiresAt}`;
    const expected = createHmac('sha256', SECRET).update(payload).digest('hex');
    if (sig !== expected) return null;
    return { userId };
  } catch {
    return null;
  }
}

// POST /api/auth/verify-email — mark email as verified
export async function POST(request: NextRequest): Promise<Response> {
  const bodySizeError = checkContentLength(request);
  if (bodySizeError) return bodySizeError;

  let body: { token?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  if (!body.token || typeof body.token !== 'string') {
    return badRequest('token is required.');
  }

  const verified = verifyToken(body.token);
  if (!verified) {
    return json({ error: 'Invalid or expired verification token.' }, 400);
  }

  try {
    const user = await db.user.findUnique({ where: { id: verified.userId }, select: { id: true, emailVerified: true } });
    if (!user) {
      return json({ error: 'User not found.' }, 404);
    }
    if (user.emailVerified) {
      return json({ ok: true, message: 'Email already verified.' });
    }
    await db.user.update({
      where: { id: verified.userId },
      data: { emailVerified: new Date() },
    });
    return json({ ok: true, message: 'Email verified successfully.' });
  } catch (err) {
    console.error('[verify-email]', err);
    return internalError();
  }
}
