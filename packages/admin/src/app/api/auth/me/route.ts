import type { NextRequest } from 'next/server';
import { db, hashPassword, verifyPassword } from '@volqan/core';
import { getSessionUser, json, unauthorized, badRequest, internalError } from '@/lib/api-helpers';

export async function GET(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  return json({ user });
}

export async function PATCH(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  let body: { name?: string; avatar?: string; currentPassword?: string; newPassword?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  const data: Record<string, unknown> = {};

  if (body.name !== undefined) {
    if (typeof body.name !== 'string') return badRequest('name must be a string.');
    data.name = body.name.trim() || null;
  }
  if (body.avatar !== undefined) {
    if (typeof body.avatar !== 'string') return badRequest('avatar must be a string.');
    data.avatar = body.avatar.trim() || null;
  }

  if (body.newPassword) {
    if (typeof body.newPassword !== 'string' || body.newPassword.length < 8) {
      return badRequest('newPassword must be at least 8 characters.');
    }
    // Require current password to change password
    if (!body.currentPassword) {
      return badRequest('currentPassword is required to change password.');
    }
    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    });
    if (!fullUser?.password) {
      return json({ error: 'Cannot change password for OAuth-only accounts.' }, 400);
    }
    const valid = await verifyPassword(body.currentPassword, fullUser.password);
    if (!valid) {
      return json({ error: 'Current password is incorrect.' }, 400);
    }
    data.password = await hashPassword(body.newPassword);
  }

  if (Object.keys(data).length === 0) {
    return badRequest('No fields to update.');
  }

  try {
    const updated = await db.user.update({
      where: { id: user.id },
      data,
      select: { id: true, email: true, name: true, avatar: true, role: true, emailVerified: true, updatedAt: true },
    });
    return json({ user: updated });
  } catch (err) {
    console.error('[me PATCH]', err);
    return internalError();
  }
}
