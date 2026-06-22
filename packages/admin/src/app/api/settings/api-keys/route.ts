import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { getSessionUser, json, unauthorized, forbidden, badRequest, internalError } from '@/lib/api-helpers';
import { randomBytes, createHash } from 'node:crypto';
import { canManageApiKeys, validateApiKeyPermissions } from '@/lib/api-key-permissions';

export async function GET(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (!canManageApiKeys(user.role)) return forbidden();

  try {
    const keys = await db.apiKey.findMany({
      where: user.role === 'SUPER_ADMIN' ? {} : { userId: user.id },
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
  if (!canManageApiKeys(user.role)) return forbidden();

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
  const { invalid, unauthorized: unauthorizedPermissions, granted } = validateApiKeyPermissions(
    user.role,
    requestedPermissions,
  );
  if (invalid.length > 0) {
    return badRequest(`Invalid permissions: ${invalid.join(', ')}`);
  }
  if (unauthorizedPermissions.length > 0) {
    return json(
      { error: `Permissions not allowed for role ${user.role}: ${unauthorizedPermissions.join(', ')}` },
      403,
    );
  }

  try {
    const raw = randomBytes(32).toString('hex');
    const fullKey = `vq_${raw}`;
    const keyHash = createHash('sha256').update(fullKey).digest('hex');

    const apiKey = await db.apiKey.create({
      data: {
        name: body.name,
        key: keyHash,
        permissions: granted,
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
