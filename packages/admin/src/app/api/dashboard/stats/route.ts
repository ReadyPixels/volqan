import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const [contentTypes, contentEntries, users, media, extensions] = await Promise.all([
    db.contentType.count(),
    db.contentEntry.count(),
    db.user.count(),
    db.media.count(),
    db.extension.count({ where: { enabled: true } }),
  ]);

  return NextResponse.json({ contentTypes, contentEntries, users, media, extensions });
}
