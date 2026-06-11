import type { NextRequest } from 'next/server';
import { db } from '@volqan/core';
import { getSessionUser, json, unauthorized, badRequest, internalError } from '@/lib/api-helpers';
import path from 'node:path';

export async function GET(request: NextRequest): Promise<Response> {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const perPage = Math.min(100, parseInt(searchParams.get('perPage') ?? '20', 10));
  const folder = searchParams.get('folder') ?? undefined;
  const search = searchParams.get('search') ?? undefined;

  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

  try {
    const where = {
      ...(isAdmin ? {} : { uploadedById: user.id }),
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

  const uploadRoot = path.resolve(process.env.VOLQAN_UPLOAD_DIR ?? './public/uploads');
  const normalizedFolder = normalizeUploadFolder(folder);
  const targetDir = path.resolve(uploadRoot, normalizedFolder);

  if (!isWithinRoot(uploadRoot, targetDir)) {
    return badRequest('Invalid upload folder.');
  }

  if (!isAllowedUpload(file.name, file.type)) {
    return badRequest('Unsupported file type.');
  }

  try {
    const { writeFile, mkdir } = await import('node:fs/promises');
    const crypto = await import('node:crypto');

    const ext = path.extname(file.name).toLowerCase();
    const unique = crypto.randomUUID();
    const filename = `${unique}${ext}`;
    await mkdir(targetDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(targetDir, filename), buffer);

    const publicUrl = `/uploads/${normalizedFolder ? `${normalizedFolder}/` : ''}${filename}`.replace(/\/\//g, '/');

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

function normalizeUploadFolder(folder: string): string {
  return folder
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9/_-]/g, '');
}

function isWithinRoot(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function isAllowedUpload(fileName: string, mimeType: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  const safeExtensions = new Set([
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif',
    '.mp4', '.mov', '.webm', '.mp3', '.wav', '.pdf',
  ]);
  const blockedExtensions = new Set(['.html', '.htm', '.svg', '.xml', '.mhtml', '.xhtml']);

  if (blockedExtensions.has(ext)) return false;
  if (safeExtensions.has(ext)) return true;

  const allowedMimePrefixes = ['image/', 'video/', 'audio/'];
  return allowedMimePrefixes.some((prefix) => mimeType.startsWith(prefix)) || mimeType === 'application/pdf';
}
