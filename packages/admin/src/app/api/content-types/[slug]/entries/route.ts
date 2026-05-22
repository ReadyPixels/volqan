import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { COOKIE_NAME, verifyToken } from '@/lib/stub-auth';

async function getAuthorId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const email = await verifyToken(token);
  if (!email) return null;
  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const contentType = await db.contentType.findUnique({ where: { slug } });
    if (!contentType) return NextResponse.json({ error: 'Content type not found' }, { status: 404 });

    const entries = await db.contentEntry.findMany({
      where: { contentTypeId: contentType.id },
      orderBy: { updatedAt: 'desc' },
      include: { author: { select: { name: true, email: true } } },
    });

    return NextResponse.json(
      entries.map((e) => {
        let data: Record<string, unknown> = {};
        try { data = JSON.parse(e.data); } catch {}
        return {
          id: e.id,
          title: (data.title as string) ?? (data.name as string) ?? e.slug ?? e.id,
          status: e.status.toLowerCase(),
          slug: e.slug ?? e.id,
          author: e.author?.name ?? e.author?.email?.split('@')[0] ?? 'Unknown',
          updatedAt: e.updatedAt.toISOString(),
          createdAt: e.createdAt.toISOString(),
          data,
        };
      }),
    );
  } catch (err) {
    console.error('[api/content-types/[slug]/entries] GET error:', err);
    return NextResponse.json({ error: 'Failed to load entries' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const contentType = await db.contentType.findUnique({ where: { slug } });
    if (!contentType) return NextResponse.json({ error: 'Content type not found' }, { status: 404 });

    const body = await req.json() as { data?: Record<string, unknown>; status?: string; slug?: string };
    const { data = {}, status = 'DRAFT', slug: entrySlug } = body;

    const authorId = await getAuthorId(req);

    const entry = await db.contentEntry.create({
      data: {
        contentTypeId: contentType.id,
        data: JSON.stringify(data),
        status: status.toUpperCase() as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED',
        slug: entrySlug ?? null,
        authorId: authorId ?? undefined,
        publishedAt: status.toUpperCase() === 'PUBLISHED' ? new Date() : null,
      },
    });

    return NextResponse.json({ id: entry.id }, { status: 201 });
  } catch (err) {
    console.error('[api/content-types/[slug]/entries] POST error:', err);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}
