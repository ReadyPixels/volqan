import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { getSessionUser, json, unauthorized, badRequest, internalError } from '@/lib/api-helpers';
import { randomBytes, createHash } from 'node:crypto';

const ALLOWED_PERMISSIONS = new Set(['read', 'write', 'media:read', 'media:write', 'users:read', 'users:write']);

export async function GET(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    const keys = await db.apiKey.findMany({
      where: user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? {} : { userId: user.id },
      select: {
        id: true, name: true, permissions: true,
        expiresAt: true, lastUsedAt: true, createdAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return json({ data: keys });
  } catch (err) {
    console.error('[api-keys GET]', err);
    return internalError();
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  let body: { name?: string; permissions?: string[]; expiresAt?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  if (!body.name || typeof body.name !== 'string') {
    return badRequest('name is required.');
  }

  const requestedPermissions = body.permissions ?? ['read'];
  const invalidPerms = requestedPermissions.filter((p) => !ALLOWED_PERMISSIONS.has(p));
  if (invalidPerms.length > 0) {
    return badRequest(`Invalid permissions: ${invalidPerms.join(', ')}`);
  }

  try {
    const raw = randomBytes(32).toString('hex');
    const fullKey = `vq_${raw}`;
    const keyHash = createHash('sha256').update(fullKey).digest('hex');

    const apiKey = await db.apiKey.create({
      data: {
        name: body.name,
        key: keyHash,
        permissions: requestedPermissions,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        userId: user.id,
      },
      select: { id: true, name: true, permissions: true, expiresAt: true, createdAt: true },
    });

    return json({ data: { ...apiKey, key: fullKey } }, 201);
  } catch (err) {
    console.error('[api-keys POST]', err);
    return internalError();
  }
}
