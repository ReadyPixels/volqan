import type { NextRequest } from 'next/server';
import { createHmac } from 'node:crypto';
import { db } from '@volqan/core';
import { json, badRequest, internalError } from '@/lib/api-helpers';
import { rateLimit } from '@/lib/rate-limit';

const SECRET = process.env.SESSION_SECRET ?? 'dev-session-secret';

/** Creates a signed password-reset token valid for 1 hour. */
export function createResetToken(userId: string): string {
  const expiresAt = Date.now() + 60 * 60 * 1000;
  const payload = `${userId}:${expiresAt}`;
  const sig = createHmac('sha256', SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

export async function POST(request: NextRequest): Promise<Response> {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';
  const rl = rateLimit(`forgot-pw:${ip}`, { max: 5, windowMs: 15 * 60 * 1000 });
  if (!rl.allowed) {
    return json({ error: 'Too many requests. Please try again later.' }, 429);
  }

  let body: { email?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  if (!body.email || typeof body.email !== 'string') {
    return badRequest('email is required.');
  }

  try {
    const user = await db.user.findUnique({
      where: { email: body.email.toLowerCase().trim() },
      select: { id: true, email: true, name: true },
    });

    // Always respond with success to avoid user enumeration
    if (!user) {
      return json({ ok: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const token = createResetToken(user.id);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    // Log the reset URL in dev; in production wire up an email provider
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[forgot-password] Reset URL for ${user.email}: ${resetUrl}`);
    }

    // TODO: send email via configured email provider
    // await sendEmail({ to: user.email, subject: 'Reset your Volqan password', html: `<a href="${resetUrl}">Reset password</a>` });

    return json({ ok: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('[forgot-password]', err);
    return internalError();
  }
}
