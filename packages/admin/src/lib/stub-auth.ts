/**
 * Stateless HMAC-SHA256 session tokens for the admin stub auth.
 * Uses only the Web Crypto API — safe to import in Next.js Edge middleware.
 *
 * Token format: base64url(payload) + "." + base64url(hmac)
 * Payload: JSON { email, exp }
 */

const COOKIE_NAME = 'volqan_session';
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  return process.env.SESSION_SECRET ?? 'volqan-stub-secret-change-me-in-production';
}

async function importKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

function b64urlEncode(buf: ArrayBuffer | Uint8Array): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function b64urlDecode(s: string): Uint8Array<ArrayBuffer> {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded + '=='.slice((padded.length + 2) % 4 || 4));
  return new Uint8Array(Array.from(raw, (c) => c.charCodeAt(0)));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export { COOKIE_NAME };

/** Returns the admin email from env (fallback: admin@volqan.link). */
export function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL ?? 'admin@volqan.link';
}

/** Returns the admin password from env (fallback: changeme). */
export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? 'changeme';
}

/** Sign a session token for the given email. */
export async function signToken(email: string): Promise<string> {
  const payload = JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS });
  const enc = new TextEncoder();
  const key = await importKey(getSecret());
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return b64urlEncode(enc.encode(payload)) + '.' + b64urlEncode(sig);
}

/** Verify a session token. Returns the email on success, null on failure. */
export async function verifyToken(token: string): Promise<string | null> {
  try {
    const dot = token.lastIndexOf('.');
    if (dot === -1) return null;
    const payloadB64 = token.slice(0, dot);
    const sigB64 = token.slice(dot + 1);

    const payloadBytes = b64urlDecode(payloadB64);
    const sigBytes = b64urlDecode(sigB64);

    const key = await importKey(getSecret());
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, payloadBytes);
    if (!valid) return null;

    const { email, exp } = JSON.parse(new TextDecoder().decode(payloadBytes)) as {
      email: string;
      exp: number;
    };
    if (Math.floor(Date.now() / 1000) > exp) return null;

    return email;
  } catch {
    return null;
  }
}
