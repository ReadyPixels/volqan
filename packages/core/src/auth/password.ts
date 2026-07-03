/**
 * @file auth/password.ts
 * @description Password hashing, verification, and strength validation for Volqan.
 *
 * Uses bcryptjs (pure-JS bcrypt) at a work factor of 12 rounds — a good balance
 * between security and performance for server-side password hashing.
 *
 * @example
 * ```ts
 * import { hashPassword, verifyPassword, validatePasswordStrength } from '@volqan/core/auth';
 *
 * const hash = await hashPassword('mySecureP@ssw0rd');
 * const valid = await verifyPassword('mySecureP@ssw0rd', hash); // true
 * const result = validatePasswordStrength('weak'); // { valid: false, ... }
 * ```
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** bcrypt work factor — higher = slower but more secure */
const BCRYPT_ROUNDS = 12;

/** Minimum number of characters for a valid password */
const MIN_PASSWORD_LENGTH = 8;

/** Maximum length to prevent DoS via extremely long passwords */
const MAX_PASSWORD_LENGTH = 72; // bcrypt silently truncates at 72 chars

// ---------------------------------------------------------------------------
// Lazy bcryptjs loader
// ---------------------------------------------------------------------------

type BcryptModule = typeof import('bcryptjs');

let _bcrypt: BcryptModule | null = null;

async function getBcrypt(): Promise<BcryptModule> {
  if (_bcrypt) return _bcrypt;
  try {
    const mod = await import('bcryptjs');
    // bcryptjs is CommonJS; under ESM interop its named exports land on
    // `.default` instead of the module namespace itself.
    _bcrypt = mod.default ?? mod;
    return _bcrypt;
  } catch {
    throw new Error(
      '[volqan:password] bcryptjs is not installed. Run: pnpm add bcryptjs',
    );
  }
}

// ---------------------------------------------------------------------------
// Hashing
// ---------------------------------------------------------------------------

/**
 * Hashes a plain-text password using bcrypt.
 *
 * @param plaintext - The raw password string provided by the user
 * @returns bcrypt hash string (60 characters)
 * @throws {Error} if the password exceeds 72 bytes (bcrypt silent truncation risk)
 */
export async function hashPassword(plaintext: string): Promise<string> {
  if (Buffer.byteLength(plaintext, 'utf8') > MAX_PASSWORD_LENGTH) {
    throw new Error(
      `Password must not exceed ${MAX_PASSWORD_LENGTH} bytes (bcrypt limit).`,
    );
  }

  const bcrypt = await getBcrypt();
  return bcrypt.hash(plaintext, BCRYPT_ROUNDS);
}

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------

/**
 * Verifies a plain-text password against a stored bcrypt hash.
 *
 * Performs a constant-time comparison to mitigate timing attacks.
 *
 * @param plaintext - The raw password provided during login
 * @param hash - The stored bcrypt hash from the database
 * @returns `true` if the password matches, `false` otherwise
 */
export async function verifyPassword(
  plaintext: string,
  hash: string,
): Promise<boolean> {
  // Sanity guard — reject clearly invalid hashes without calling bcrypt
  if (!hash || !hash.startsWith('$2')) {
    return false;
  }

  const bcrypt = await getBcrypt();
  return bcrypt.compare(plaintext, hash);
}

// ---------------------------------------------------------------------------
// Strength validation
// ---------------------------------------------------------------------------

/**
 * Result of a password strength check.
 */
export interface PasswordStrengthResult {
  /** Whether the password meets all requirements */
  valid: boolean;
  /** Human-readable score label */
  strength: 'too-short' | 'weak' | 'fair' | 'strong' | 'very-strong';
  /** Numeric score: 0 (worst) to 4 (best) */
  score: number;
  /** List of validation failures, empty when valid */
  errors: string[];
  /** Suggestions to improve the password */
  suggestions: string[];
}

/**
 * Validates password strength without hashing it.
 *
 * Requirements:
 * - At least {@link MIN_PASSWORD_LENGTH} characters
 * - At most {@link MAX_PASSWORD_LENGTH} characters
 *
 * Scoring (1 point each):
 * - Has lowercase letter
 * - Has uppercase letter
 * - Has digit
 * - Has special character
 * - Length >= 12 characters (bonus)
 *
 * @param password - Plain-text password to evaluate
 * @returns {@link PasswordStrengthResult}
 */
export function validatePasswordStrength(
  password: string,
): PasswordStrengthResult {
  const errors: string[] = [];
  const suggestions: string[] = [];

  // Hard requirements
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
  }
  if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_LENGTH) {
    errors.push(`Password must not exceed ${MAX_PASSWORD_LENGTH} characters.`);
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const isLong = password.length >= 12;

  if (!hasLower) suggestions.push('Add lowercase letters.');
  if (!hasUpper) suggestions.push('Add uppercase letters.');
  if (!hasDigit) suggestions.push('Add at least one number.');
  if (!hasSpecial) suggestions.push('Add a special character (e.g. @, #, !).');
  if (!isLong) suggestions.push('Use at least 12 characters for a stronger password.');

  const score =
    (hasLower ? 1 : 0) +
    (hasUpper ? 1 : 0) +
    (hasDigit ? 1 : 0) +
    (hasSpecial ? 1 : 0) +
    (isLong ? 1 : 0);

  const strengthMap: Record<number, PasswordStrengthResult['strength']> = {
    0: 'weak',
    1: 'weak',
    2: 'fair',
    3: 'strong',
    4: 'strong',
    5: 'very-strong',
  };

  const isTooShort = password.length < MIN_PASSWORD_LENGTH;
  const strength: PasswordStrengthResult['strength'] = isTooShort
    ? 'too-short'
    : (strengthMap[score] ?? 'weak');

  return {
    valid: errors.length === 0,
    strength,
    score,
    errors,
    suggestions,
  };
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Checks whether a value looks like a bcrypt hash without verifying it.
 * Useful for defensive checks before storing or comparing hashes.
 *
 * @param value - String to test
 */
export function isBcryptHash(value: string): boolean {
  return /^\$2[abxy]\$\d{2}\$/.test(value);
}
