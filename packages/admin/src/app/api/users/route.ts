import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      users.map((u) => ({
        id: u.id,
        name: u.name ?? u.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email: u.email,
        role: u.role.toLowerCase() as string,
        status: 'active',
        lastSeen: u.updatedAt.toISOString(),
      })),
    );
  } catch (err) {
    console.error('[api/users] GET error:', err);
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
  }
}
