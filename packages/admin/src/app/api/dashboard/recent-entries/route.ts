import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const entries = await db.contentEntry.findMany({
    take: 5,
    orderBy: { updatedAt: 'desc' },
    include: {
      contentType: { select: { name: true, slug: true } },
      author: { select: { name: true, email: true } },
    },
  });

  const data = entries.map((e) => ({
    id: e.id,
    data: e.data,
    status: e.status.toLowerCase(),
    slug: e.slug ?? e.id,
    updatedAt: e.updatedAt.toISOString(),
    contentType: e.contentType.name,
    contentTypeSlug: e.contentType.slug,
    author: e.author?.name ?? e.author?.email?.split('@')[0] ?? 'Unknown',
  }));

  return NextResponse.json(data);
}
