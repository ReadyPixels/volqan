import type { NextRequest } from 'next/server';
import { db, hashPassword } from '@volqan/core';
import { getSessionUser, json, unauthorized, notFound, badRequest, internalError } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  try {
    const target = await db.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, avatar: true, emailVerified: true, createdAt: true },
    });
    if (!target) return notFound('User not found.');
    return json({ data: target });
  } catch (err) {
    console.error('[users/:id GET]', err);
    return internalError();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role === 'VIEWER' || user.role === 'EDITOR') return json({ error: 'Forbidden' }, 403);

  const { id } = await params;
  let body: { name?: string; role?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return badRequest('Invalid JSON body.');
  }

  // Prevent privilege escalation — only SUPER_ADMIN can set SUPER_ADMIN role
  if (body.role === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
    return json({ error: 'Only SUPER_ADMIN can grant the SUPER_ADMIN role.' }, 403);
  }

  try {
    const target = await db.user.findUnique({ where: { id } });
    if (!target) return notFound('User not found.');

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.password) updateData.passwordHash = await hashPassword(body.password);

    const updated = await db.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, updatedAt: true },
    });

    return json({ data: updated });
  } catch (err) {
    console.error('[users/:id PATCH]', err);
    return internalError();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role !== 'SUPER_ADMIN') return json({ error: 'Only SUPER_ADMIN can delete users.' }, 403);

  const { id } = await params;
  if (id === user.id) return badRequest('You cannot delete your own account.');

  try {
    const target = await db.user.findUnique({ where: { id } });
    if (!target) return notFound('User not found.');

    await db.user.delete({ where: { id } });
    return json({ ok: true });
  } catch (err) {
    console.error('[users/:id DELETE]', err);
    return internalError();
  }
}
