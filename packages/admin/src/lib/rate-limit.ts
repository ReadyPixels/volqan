/**
 * Sliding-window rate limiter with Redis backing.
 * Uses Redis when REDIS_URL is set; falls back to in-memory Map for single-instance development.
 */

interface Window {
  count: number;
  resetAt: number;
}

const memStore = new Map<string, Window>();

export interface RateLimitOptions {
  /** Maximum number of requests allowed per window */
  max: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

// Singleton Redis client for rate limiting
let redisClient: {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { PX?: number }): Promise<unknown>;
} | null = null;
let redisInit = false;

async function getRedis() {
  if (redisInit) return redisClient;
  redisInit = true;
  if (!process.env.REDIS_URL) return null;
  try {
    const { createClient } = await import('redis' as any);
    const client = createClient({ url: process.env.REDIS_URL });
    await client.connect();
    redisClient = client as any;
  } catch {
    redisClient = null;
  }
  return redisClient;
}

export async function rateLimit(key: string, opts: RateLimitOptions): Promise<RateLimitResult> {
  const now = Date.now();
  const r = await getRedis();

  if (r) {
    // Redis-backed sliding window using simple counter + TTL
    const windowKey = `rl:${key}`;
    const raw = await r.get(windowKey);
    if (!raw) {
      await r.set(windowKey, '1', { PX: opts.windowMs });
      return { allowed: true, remaining: opts.max - 1, resetAt: now + opts.windowMs };
    }
    const count = parseInt(raw, 10) + 1;
    await r.set(windowKey, String(count), { PX: opts.windowMs });
    const remaining = Math.max(0, opts.max - count);
    return { allowed: count <= opts.max, remaining, resetAt: now + opts.windowMs };
  }

  // In-memory fallback
  let window = memStore.get(key);
  if (!window || now >= window.resetAt) {
    window = { count: 1, resetAt: now + opts.windowMs };
    memStore.set(key, window);
    return { allowed: true, remaining: opts.max - 1, resetAt: window.resetAt };
  }
  window.count++;
  const remaining = Math.max(0, opts.max - window.count);
  return {
    allowed: window.count <= opts.max,
    remaining,
    resetAt: window.resetAt,
  };
}

// Prune expired in-memory entries every 5 minutes to prevent unbounded growth
setInterval(() => {
  const now = Date.now();
  for (const [key, window] of memStore.entries()) {
    if (now >= window.resetAt) memStore.delete(key);
  }
}, 5 * 60 * 1000);
