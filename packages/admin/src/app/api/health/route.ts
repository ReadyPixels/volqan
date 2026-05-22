import { db } from '@volqan/core';

export async function GET(): Promise<Response> {
  const start = Date.now();

  try {
    await db.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;

    return Response.json({
      status: 'ok',
      db: 'connected',
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return Response.json(
      {
        status: 'degraded',
        db: 'unreachable',
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
