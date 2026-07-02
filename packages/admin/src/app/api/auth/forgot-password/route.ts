import type { NextRequest } from 'next/server';
import { createHmac, randomInt } from 'node:crypto';
import { db } from '@volqan/core';
import { json, badRequest, internalError } from '@/lib/api-helpers';
import { rateLimit } from '@/lib/rate-limit';
import { checkContentLength } from '@/lib/body-limit';
import { sendEmail } from '@/lib/email';

import { getRequiredSessionSecret } from '@/lib/session-secret';

const SECRET = getRequiredSessionSecret();

/** Reset codes are valid for 15 minutes. */
export const RESET_CODE_TTL_MS = 15 * 60 * 1000;

export function hashResetCode(userId: string, code: string): string {
  return createHmac('sha256', SECRET).update(`${userId}:${code}`).digest('hex');
}

function resetSettingKey(userId: string): string {
  return `auth.pwreset.${userId}`;
}

export async function POST(request: NextRequest): Promise<Response> {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';
  const rl = await rateLimit(`forgot-pw:${ip}`, { max: 5, windowMs: 15 * 60 * 1000 });
  if (!rl.allowed) {
    return json({ error: 'Too many requests. Please try again later.' }, 429);
  }

  const bodySizeError = checkContentLength(request);
  if (bodySizeError) return bodySizeError;

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
      return json({ ok: true, message: 'If that email exists, a reset code has been sent.' });
    }

    // 6-digit code sent by email; only its HMAC is stored
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const record = {
      codeHash: hashResetCode(user.id, code),
      expiresAt: Date.now() + RESET_CODE_TTL_MS,
      attempts: 0,
    };
    await db.setting.upsert({
      where: { key: resetSettingKey(user.id) },
      create: { key: resetSettingKey(user.id), value: record, group: 'auth', isPublic: false },
      update: { value: record },
    });

    const greeting = user.name ? `Hi ${user.name},` : 'Hi,';
    const codeHtml = `<p>${greeting}</p><p>Your password reset code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</p><p>Enter this code on the reset page within 15 minutes. If you did not request this, you can safely ignore this email.</p>`;
    await sendEmail({
      to: user.email,
      subject: 'Your Volqan password reset code',
      html: codeHtml,
      text: [
        greeting,
        '',
        `Your password reset code is: ${code}`,
        '',
        'Enter this code on the reset page within 15 minutes.',
        'If you did not request this, you can safely ignore this email.',
      ].join('\n'),
    });

    return json({ ok: true, message: 'If that email exists, a reset code has been sent.' });
  } catch (err) {
    console.error('[forgot-password]', err);
    return internalError();
  }
}
