import { db } from '@volqan/core';
import { json } from '@/lib/api-helpers';

/**
 * Reports whether this Volqan instance still needs first-run setup, and
 * whether the configured database is currently reachable. The install
 * wizard polls this before showing its form; the app's own layout uses it
 * to redirect between `/install` and `/login`.
 */
export async function GET(): Promise<Response> {
  try {
    await db.$queryRaw`SELECT 1`;
  } catch (err) {
    console.error('[install/status]', err);
    return json({ dbConnected: false, installed: false });
  }

  const userCount = await db.user.count();
  return json({ dbConnected: true, installed: userCount > 0 });
}
