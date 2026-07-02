import type { NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { db, hashPassword, destroyAllUserSessions } from '@volqan/core';
import { json, badRequest, internalError } from '@/lib/api-helpers';
import { rateLimit } from '@/lib/rate-limit';
import { checkContentLength } from '@/lib/body-limit';
import { hashResetCode } from '../forgot-password/route';

const MAX_CODE_ATTEMPTS = 5;
const GENERIC_ERROR = 'Invalid email or reset code.';

interface ResetRecord {
  codeHash: string;
  expiresAt: number;
  attempts: number;
}

export async function POST(request: NextRequest): Promise<Response> {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';
  const rl = await rateLimit(`reset-pw:${ip}`, { max: 10, windowMs: 15 * 60 * 1000 });
  if (!rl.allowed) {
    return json({ error: 'Too many requests. Please try again later.' }, 429);
  }

  const bodySizeError = checkContentLength(request);
  if (bodySizeError) return bodySizeError;

  let body: { email?: string; code?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  if (!body.email || typeof body.email !== 'string') {
    return badRequest('email is required.');
  }
  if (!body.code || typeof body.code !== 'string' || !/^\d{6}$/.test(body.code)) {
    return badRequest('code must be the 6-digit code from your email.');
  }
  if (!body.password || typeof body.password !== 'string' || body.password.length < 8) {
    return badRequest('password must be at least 8 characters.');
  }

  try {
    const user = await db.user.findUnique({
      where: { email: body.email.toLowerCase().trim() },
      select: { id: true },
    });
    if (!user) return json({ error: GENERIC_ERROR }, 400);

    const key = `auth.pwreset.${user.id}`;
    const setting = await db.setting.findUnique({ where: { key } });
    const record = setting?.value as ResetRecord | undefined;
    if (!record?.codeHash || Date.now() > record.expiresAt) {
      return json({ error: GENERIC_ERROR }, 400);
    }
    if (record.attempts >= MAX_CODE_ATTEMPTS) {
      await db.setting.delete({ where: { key } }).catch(() => null);
      return json({ error: 'Too many incorrect attempts. Request a new code.' }, 400);
    }

    const expected = Buffer.from(record.codeHash, 'hex');
    const actual = Buffer.from(hashResetCode(user.id, body.code), 'hex');
    const matches = expected.length === actual.length && timingSafeEqual(expected, actual);

    if (!matches) {
      await db.setting.update({
        where: { key },
        data: { value: { ...record, attempts: record.attempts + 1 } },
      });
      return json({ error: GENERIC_ERROR }, 400);
    }

    const passwordHash = await hashPassword(body.password);
    await db.user.update({
      where: { id: user.id },
      data: { password: passwordHash },
    });

    // The code is single-use, and all sessions are invalidated on reset
    await db.setting.delete({ where: { key } }).catch(() => null);
    await destroyAllUserSessions(user.id);

    return json({ ok: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('[reset-password]', err);
    return internalError();
  }
}
