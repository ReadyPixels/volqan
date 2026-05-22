import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';
import { COOKIE_NAME, verifyToken } from '@/lib/stub-auth';

export async function GET() {
  try {
    const media = await db.media.findMany({
      orderBy: { createdAt: 'desc' },
      include: { uploadedBy: { select: { name: true, email: true } } },
    });

    return NextResponse.json(
      media.map((m) => ({
        id: m.id,
        name: m.filename,
        originalName: m.originalName,
        type: m.mimeType.startsWith('image/') ? 'image' : m.mimeType.startsWith('video/') ? 'video' : 'file',
        mimeType: m.mimeType,
        size: formatSize(m.size),
        sizeBytes: m.size,
        folder: m.folder ?? null,
        url: m.url,
        createdAt: m.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    console.error('[api/media] GET error:', err);
    return NextResponse.json({ error: 'Failed to load media' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    let uploadedById: string | undefined;
    if (token) {
      const email = await verifyToken(token);
      if (email) {
        const user = await db.user.findUnique({ where: { email }, select: { id: true } });
        uploadedById = user?.id;
      }
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string | null) ?? null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name);
    const base = path.basename(file.name, ext).replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filename = `${base}-${Date.now()}${ext}`;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(path.join(uploadsDir, filename), buffer);

    const media = await db.media.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        url: `/uploads/${filename}`,
        folder: folder ?? null,
        storageProvider: 'LOCAL',
        uploadedById: uploadedById ?? null,
      },
    });

    return NextResponse.json({
      id: media.id,
      name: media.filename,
      originalName: media.originalName,
      type: media.mimeType.startsWith('image/') ? 'image' : media.mimeType.startsWith('video/') ? 'video' : 'file',
      mimeType: media.mimeType,
      size: formatSize(media.size),
      sizeBytes: media.size,
      folder: media.folder ?? null,
      url: media.url,
      createdAt: media.createdAt.toISOString(),
    }, { status: 201 });
  } catch (err) {
    console.error('[api/media] POST error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}
