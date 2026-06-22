import type { NextRequest } from 'next/server';
import { destroySession, clearSessionCookie, SESSION_COOKIE_NAME } from '@volqan/core';
import { json } from '@/lib/api-helpers';

export async function POST(request: NextRequest): Promise<Response> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await destroySession(token).catch(() => null);
  }

  const response = json({ ok: true });
  clearSessionCookie(response);
  return response;
}
