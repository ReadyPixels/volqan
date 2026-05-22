import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { getSessionUser, json, unauthorized, badRequest, internalError } from '@/lib/api-helpers';
import { randomBytes } from 'node:crypto';

export async function GET(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    const keys = await db.apiKey.findMany({
      where: user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? {} : { userId: user.id },
      select: {
        id: true, name: true, prefix: true, scopes: true,
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

  let body: { name?: string; scopes?: string[]; expiresAt?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  if (!body.name || typeof body.name !== 'string') {
    return badRequest('name is required.');
  }

  try {
    const raw = randomBytes(32).toString('hex');
    const prefix = raw.slice(0, 8);
    const fullKey = `vq_${raw}`;

    const key = await db.apiKey.create({
      data: {
        name: body.name,
        prefix,
        hash: fullKey, // In production hash this; stored as plaintext here for initial MVP
        scopes: body.scopes ?? ['read'],
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        userId: user.id,
      },
      select: { id: true, name: true, prefix: true, scopes: true, expiresAt: true, createdAt: true },
    });

    // Return the raw key only once
    return json({ data: { ...key, key: fullKey } }, 201);
  } catch (err) {
    console.error('[api-keys POST]', err);
    return internalError();
  }
}
