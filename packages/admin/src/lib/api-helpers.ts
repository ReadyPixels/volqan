import type { NextRequest } from 'next/server';
import { validateSession, SESSION_COOKIE_NAME } from '@volqan/core';
import type { AuthUser } from '@volqan/core';

export interface ApiContext {
  user: AuthUser;
}

/** Resolves the session cookie into an authenticated user, or returns null. */
export async function getSessionUser(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { user } = await validateSession(token);
    return user;
  } catch {
    return null;
  }
}

/** Returns a typed JSON response. */
export function json<T>(data: T, status = 200): Response {
  return Response.json(data, { status });
}

export function unauthorized(message = 'Unauthorized'): Response {
  return json({ error: message }, 401);
}

export function forbidden(message = 'Forbidden'): Response {
  return json({ error: message }, 403);
}

export function notFound(message = 'Not found'): Response {
  return json({ error: message }, 404);
}

export function badRequest(message: string): Response {
  return json({ error: message }, 400);
}

export function internalError(message = 'Internal server error'): Response {
  return json({ error: message }, 500);
}
