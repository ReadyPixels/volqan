import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  try {
    const { slug, id } = await params;
    const contentType = await db.contentType.findUnique({ where: { slug } });
    if (!contentType) return NextResponse.json({ error: 'Content type not found' }, { status: 404 });

    const entry = await db.contentEntry.findFirst({
      where: { id, contentTypeId: contentType.id },
      include: { author: { select: { name: true, email: true } }, contentType: { select: { fields: true } } },
    });
    if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });

    let data: Record<string, unknown> = {};
    try { data = JSON.parse(entry.data); } catch {}

    let fields: unknown[] = [];
    try { fields = JSON.parse(entry.contentType.fields); } catch {}

    return NextResponse.json({
      id: entry.id,
      data,
      fields,
      status: entry.status.toLowerCase(),
      slug: entry.slug ?? entry.id,
      authorName: entry.author?.name ?? entry.author?.email?.split('@')[0] ?? 'Unknown',
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
      publishedAt: entry.publishedAt?.toISOString() ?? null,
    });
  } catch (err) {
    console.error('[api/content-types/[slug]/entries/[id]] GET error:', err);
    return NextResponse.json({ error: 'Failed to load entry' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  try {
    const { slug, id } = await params;
    const contentType = await db.contentType.findUnique({ where: { slug } });
    if (!contentType) return NextResponse.json({ error: 'Content type not found' }, { status: 404 });

    const body = await req.json() as { data?: Record<string, unknown>; status?: string; slug?: string };
    const { data, status, slug: entrySlug } = body;

    const existing = await db.contentEntry.findFirst({ where: { id, contentTypeId: contentType.id } });
    if (!existing) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });

    const upperStatus = status?.toUpperCase() as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED' | undefined;
    const entry = await db.contentEntry.update({
      where: { id },
      data: {
        ...(data !== undefined ? { data: JSON.stringify(data) } : {}),
        ...(upperStatus ? { status: upperStatus } : {}),
        ...(entrySlug !== undefined ? { slug: entrySlug } : {}),
        ...(upperStatus === 'PUBLISHED' && !existing.publishedAt ? { publishedAt: new Date() } : {}),
      },
    });

    return NextResponse.json({ id: entry.id });
  } catch (err) {
    console.error('[api/content-types/[slug]/entries/[id]] PUT error:', err);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  try {
    const { slug, id } = await params;
    const contentType = await db.contentType.findUnique({ where: { slug } });
    if (!contentType) return NextResponse.json({ error: 'Content type not found' }, { status: 404 });

    const existing = await db.contentEntry.findFirst({ where: { id, contentTypeId: contentType.id } });
    if (!existing) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });

    await db.contentEntry.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error('[api/content-types/[slug]/entries/[id]] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
