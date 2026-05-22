import type { NextRequest } from 'next/server';
import { destroySession, SESSION_COOKIE_NAME } from '@volqan/core';
import { json } from '@/lib/api-helpers';

export async function POST(request: NextRequest): Promise<Response> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await destroySession(token).catch(() => null);
  }

  const response = json({ ok: true });
  // Clear the cookie
  response.headers.set(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  );
  return response;
}
