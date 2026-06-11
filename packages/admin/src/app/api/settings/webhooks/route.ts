import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { getSessionUser, json, unauthorized, badRequest, internalError } from '@/lib/api-helpers';
import { randomBytes } from 'node:crypto';

const VALID_EVENTS = [
  'content.created', 'content.updated', 'content.published', 'content.archived', 'content.deleted',
  'user.created', 'user.updated', 'user.deleted',
  'media.uploaded', 'media.deleted',
  'extension.enabled', 'extension.disabled',
  '*',
];

export async function GET(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') return json({ error: 'Forbidden' }, 403);

  try {
    const webhooks = await db.webhook.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, url: true, events: true, enabled: true, lastStatus: true, lastFiredAt: true, createdAt: true },
    });
    return json({ data: webhooks });
  } catch (err) {
    console.error('[webhooks GET]', err);
    return internalError();
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') return json({ error: 'Forbidden' }, 403);

  let body: { name?: string; url?: string; events?: string[]; secret?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  if (!body.name || !body.url) return badRequest('name and url are required.');

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(body.url);
  } catch {
    return badRequest('url must be a valid URL.');
  }
  if (parsedUrl.protocol !== 'https:') return badRequest('url must use HTTPS.');

  const events = (body.events ?? ['*']).filter((e) => VALID_EVENTS.includes(e));
  const secret = body.secret ?? randomBytes(24).toString('hex');

  try {
    const webhook = await db.webhook.create({
      data: { name: body.name, url: body.url, events, secret, enabled: true },
    });
    return json({ data: { ...webhook, secret } }, 201);
  } catch (err) {
    console.error('[webhooks POST]', err);
    return internalError();
  }
}
