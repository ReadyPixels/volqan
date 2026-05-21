import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const types = await db.contentType.findMany({
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { entries: true } } },
    });

    return NextResponse.json(
      types.map((t) => ({
        id: t.id,
        slug: t.slug,
        name: t.name,
        description: t.description ?? '',
        fields: JSON.parse(t.fields),
        settings: JSON.parse(t.settings),
        isSystem: t.isSystem,
        entryCount: t._count.entries,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
    );
  } catch (err) {
    console.error('[api/content-types] GET error:', err);
    return NextResponse.json({ error: 'Failed to load content types' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, description, fields, settings } = body as {
      name: string;
      slug: string;
      description?: string;
      fields?: unknown[];
      settings?: Record<string, unknown>;
    };

    if (!name || !slug) {
      return NextResponse.json({ error: 'name and slug are required' }, { status: 400 });
    }

    const type = await db.contentType.create({
      data: {
        name,
        slug,
        description: description ?? null,
        fields: JSON.stringify(fields ?? []),
        settings: JSON.stringify(settings ?? {}),
      },
    });

    return NextResponse.json(
      {
        id: type.id,
        slug: type.slug,
        name: type.name,
        description: type.description ?? '',
        fields: JSON.parse(type.fields),
        settings: JSON.parse(type.settings),
        isSystem: type.isSystem,
        entryCount: 0,
        createdAt: type.createdAt,
        updatedAt: type.updatedAt,
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === 'P2002') {
      return NextResponse.json({ error: 'A content type with that slug already exists' }, { status: 409 });
    }
    console.error('[api/content-types] POST error:', err);
    return NextResponse.json({ error: 'Failed to create content type' }, { status: 500 });
  }
}
