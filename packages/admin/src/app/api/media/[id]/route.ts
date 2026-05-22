import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { getSessionUser, json, unauthorized, notFound, internalError } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  try {
    const file = await db.media.findUnique({ where: { id } });
    if (!file) return notFound('Media file not found.');
    return json({ data: file });
  } catch (err) {
    console.error('[media/:id GET]', err);
    return internalError();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role === 'VIEWER') return json({ error: 'Forbidden' }, 403);

  const { id } = await params;
  try {
    const file = await db.media.findUnique({ where: { id } });
    if (!file) return notFound('Media file not found.');

    // EDITOR can only delete own uploads
    if (user.role === 'EDITOR' && file.uploadedById !== user.id) {
      return json({ error: 'Forbidden' }, 403);
    }

    // Attempt to remove the physical file (best-effort)
    if (file.storageProvider === 'local' && file.url) {
      const path = await import('node:path');
      const fs = await import('node:fs/promises');
      const uploadDir = process.env.VOLQAN_UPLOAD_DIR ?? './public/uploads';
      const filePath = path.join(uploadDir, file.url.replace('/uploads', ''));
      await fs.unlink(filePath).catch(() => null);
    }

    await db.media.delete({ where: { id } });
    return json({ ok: true });
  } catch (err) {
    console.error('[media/:id DELETE]', err);
    return internalError();
  }
}
