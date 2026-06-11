/**
 * Simple in-memory sliding-window rate limiter.
 * Resets on server restart — adequate for brute-force protection in single-instance deployments.
 * Replace with Redis for multi-instance setups.
 */

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

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

export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  let window = store.get(key);

  if (!window || now >= window.resetAt) {
    window = { count: 1, resetAt: now + opts.windowMs };
    store.set(key, window);
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

// Prune expired entries every 5 minutes to prevent unbounded growth
setInterval(() => {
  const now = Date.now();
  for (const [key, window] of store.entries()) {
    if (now >= window.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);
