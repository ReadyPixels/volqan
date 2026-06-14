import type { NextRequest } from 'next/server';
import { db, hashPassword } from '@volqan/core';
import { getSessionUser, json, unauthorized, badRequest, internalError } from '@/lib/api-helpers';
import { sendEmail, inviteEmail } from '@/lib/email';
import { audit } from '@/lib/audit';
import { fireWebhooks } from '@/lib/webhook';
import { checkContentLength } from '@/lib/body-limit';

export async function GET(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const perPage = Math.min(100, parseInt(searchParams.get('perPage') ?? '20', 10));
  const search = searchParams.get('search') ?? undefined;

  try {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true, email: true, name: true, role: true,
          avatar: true, emailVerified: true, createdAt: true, updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      db.user.count({ where }),
    ]);

    return json({
      data: users,
      meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    });
  } catch (err) {
    console.error('[users GET]', err);
    return internalError();
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role === 'VIEWER' || user.role === 'EDITOR') return json({ error: 'Forbidden' }, 403);

  const bodySizeError = checkContentLength(request);
  if (bodySizeError) return bodySizeError;

  let body: { email?: string; name?: string; role?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  if (!body.email || typeof body.email !== 'string') {
    return badRequest('email is required.');
  }

  const tempPassword = body.password ?? Math.random().toString(36).slice(-10) + 'A1!';

  try {
    const existing = await db.user.findUnique({ where: { email: body.email.toLowerCase().trim() } });
    if (existing) return json({ error: 'A user with that email already exists.' }, 409);

    const password = await hashPassword(tempPassword);
    const newUser = await db.user.create({
      data: {
        email: body.email.toLowerCase().trim(),
        name: body.name ?? null,
        role: (body.role as any) ?? 'EDITOR',
        password,
        requirePasswordChange: true,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    await sendEmail(inviteEmail({ to: newUser.email, name: newUser.name ?? undefined, tempPassword, appUrl })).catch(
      (err) => console.error('[users POST] invite email failed:', err),
    );
    await audit({ userId: user.id, action: 'user.created', resource: 'User', resourceId: newUser.id, details: { email: newUser.email, role: newUser.role } });
    await fireWebhooks('user.created', { id: newUser.id, email: newUser.email, role: newUser.role }).catch(() => {});

    return json({ data: newUser, tempPassword: body.password ? undefined : tempPassword }, 201);
  } catch (err) {
    console.error('[users POST]', err);
    return internalError();
  }
}
