import { createHmac } from 'node:crypto';

const SECRET = process.env.LICENSE_SECRET ?? process.env.SESSION_SECRET ?? 'dev-license-secret';

/** Generates a marketplace license key: MKT-{productId}-{installId}-{expiryHash} */
export function generateLicenseKey(productId: string, installId: string, expiresAt: Date): string {
  const expiry = Math.floor(expiresAt.getTime() / 1000).toString(16).toUpperCase();
  const payload = `${productId}:${installId}:${expiry}`;
  const sig = createHmac('sha256', SECRET).update(payload).digest('hex').slice(0, 12).toUpperCase();
  return `MKT-${productId}-${installId}-${expiry}${sig}`;
}

export interface LicensePayload {
  productId: string;
  installId: string;
  expiresAt: Date;
  valid: boolean;
  expired: boolean;
}

/** Validates a license key. Returns payload with valid/expired flags. */
export function validateLicenseKey(key: string): LicensePayload | null {
  const parts = key.split('-');
  // MKT-{productId}-{installId}-{expiryHash}  → parts[0]=MKT, [1]=productId, [2]=installId, [3]=expiryHash
  if (parts.length < 4 || parts[0] !== 'MKT') return null;

  const productId = parts[1];
  const installId = parts[2];
  const expiryHash = parts[3]; // last 12 chars are sig, first chars are expiry hex

  if (!productId || !installId || !expiryHash || expiryHash.length < 13) return null;

  const expiry = expiryHash.slice(0, expiryHash.length - 12);
  const providedSig = expiryHash.slice(expiryHash.length - 12);

  const payload = `${productId}:${installId}:${expiry}`;
  const expectedSig = createHmac('sha256', SECRET).update(payload).digest('hex').slice(0, 12).toUpperCase();

  if (providedSig !== expectedSig) return null;

  const expiresAt = new Date(parseInt(expiry, 16) * 1000);
  const expired = expiresAt < new Date();

  return { productId, installId, expiresAt, valid: !expired, expired };
}
