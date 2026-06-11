/**
 * Content API cache.
 * Uses Redis when REDIS_URL is set; falls back to an in-process LRU cache.
 * TTL defaults to 60 seconds. Pass ttl=0 to skip caching.
 */

const DEFAULT_TTL = 60; // seconds

// --- In-process fallback LRU ---

interface CacheEntry { value: string; expiresAt: number }
const mem = new Map<string, CacheEntry>();
const MAX_MEM_ENTRIES = 1000;

function memGet(key: string): string | null {
  const entry = mem.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { mem.delete(key); return null; }
  return entry.value;
}

function memSet(key: string, value: string, ttl: number): void {
  if (mem.size >= MAX_MEM_ENTRIES) {
    // Evict oldest entry
    const first = mem.keys().next().value;
    if (first) mem.delete(first);
  }
  mem.set(key, { value, expiresAt: Date.now() + ttl * 1000 });
}

function memDel(key: string): void { mem.delete(key); }

function memFlushPrefix(prefix: string): void {
  for (const key of mem.keys()) {
    if (key.startsWith(prefix)) mem.delete(key);
  }
}

// --- Redis client (lazy-loaded) ---

type RedisClient = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { EX?: number }): Promise<unknown>;
  del(key: string): Promise<unknown>;
  keys(pattern: string): Promise<string[]>;
};

let redis: RedisClient | null = null;
let redisInitialized = false;

async function getRedis(): Promise<RedisClient | null> {
  if (redisInitialized) return redis;
  redisInitialized = true;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    const { createClient } = await import('redis' as any);
    const client = createClient({ url });
    await client.connect();
    redis = client as RedisClient;
    console.log('[cache] Redis connected');
  } catch (err) {
    console.warn('[cache] Redis unavailable, using in-process cache:', err);
    redis = null;
  }
  return redis;
}

// --- Public API ---

export async function cacheGet(key: string): Promise<unknown | null> {
  const r = await getRedis();
  try {
    const raw = r ? await r.get(key) : memGet(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttl = DEFAULT_TTL): Promise<void> {
  if (ttl <= 0) return;
  const raw = JSON.stringify(value);
  const r = await getRedis();
  try {
    if (r) {
      await r.set(key, raw, { EX: ttl });
    } else {
      memSet(key, raw, ttl);
    }
  } catch (err) {
    console.warn('[cache] set failed:', err);
  }
}

export async function cacheDel(key: string): Promise<void> {
  const r = await getRedis();
  try {
    if (r) await r.del(key); else memDel(key);
  } catch { /* non-fatal */ }
}

export async function cacheFlush(prefix: string): Promise<void> {
  const r = await getRedis();
  try {
    if (r) {
      const keys = await r.keys(`${prefix}*`);
      for (const k of keys) await r.del(k);
    } else {
      memFlushPrefix(prefix);
    }
  } catch { /* non-fatal */ }
}

/** Wrap an async loader with cache-aside pattern. */
export async function cached<T>(
  key: string,
  loader: () => Promise<T>,
  ttl = DEFAULT_TTL,
): Promise<T> {
  const hit = await cacheGet(key);
  if (hit !== null) return hit as T;
  const value = await loader();
  await cacheSet(key, value, ttl);
  return value;
}
