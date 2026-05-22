import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { getSessionUser, json, unauthorized, badRequest, internalError } from '@/lib/api-helpers';

export async function GET(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const perPage = Math.min(100, parseInt(searchParams.get('perPage') ?? '20', 10));
  const folder = searchParams.get('folder') ?? undefined;
  const search = searchParams.get('search') ?? undefined;

  try {
    const where = {
      ...(folder ? { folder } : {}),
      ...(search ? { filename: { contains: search, mode: 'insensitive' as const } } : {}),
    };

    const [files, total] = await Promise.all([
      db.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      db.media.count({ where }),
    ]);

    return json({
      data: files,
      meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    });
  } catch (err) {
    console.error('[media GET]', err);
    return internalError();
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role === 'VIEWER') return json({ error: 'Forbidden' }, 403);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return badRequest('Expected multipart/form-data upload.');
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return badRequest('No file provided. Use field name "file".');
  }

  const folder = (formData.get('folder') as string | null) ?? '/';
  const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

  if (file.size > MAX_BYTES) {
    return badRequest('File exceeds the 10 MB size limit.');
  }

  try {
    const uploadDir = process.env.VOLQAN_UPLOAD_DIR ?? './public/uploads';
    const { writeFile, mkdir } = await import('node:fs/promises');
    const path = await import('node:path');
    const crypto = await import('node:crypto');

    const ext = path.extname(file.name);
    const unique = crypto.randomUUID();
    const filename = `${unique}${ext}`;
    const folderPath = path.join(uploadDir, folder.replace(/^\//, ''));

    await mkdir(folderPath, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(folderPath, filename), buffer);

    const publicUrl = `/uploads/${folder.replace(/^\//, '')}/${filename}`.replace(/\/\//g, '/');

    const record = await db.media.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: publicUrl,
        folder,
        uploadedById: user.id,
        storageProvider: 'local',
      },
    });

    return json({ data: record }, 201);
  } catch (err) {
    console.error('[media POST]', err);
    return internalError();
  }
}
