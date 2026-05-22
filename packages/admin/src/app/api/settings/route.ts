import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const rows = await db.setting.findMany({ orderBy: { key: 'asc' } });
    const result: Record<string, string> = {};
    for (const row of rows) {
      try {
        result[row.key] = JSON.parse(row.value);
      } catch {
        result[row.key] = row.value;
      }
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error('[api/settings] GET error:', err);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, string>;
    await Promise.all(
      Object.entries(body).map(([key, value]) =>
        db.setting.upsert({
          where: { key },
          create: { key, value: JSON.stringify(value), group: key.split('.')[0] },
          update: { value: JSON.stringify(value) },
        }),
      ),
    );
    return NextResponse.json({ saved: true });
  } catch (err) {
    console.error('[api/settings] PUT error:', err);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
