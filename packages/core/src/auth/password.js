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
let _bcrypt = null;
async function getBcrypt() {
    if (_bcrypt)
        return _bcrypt;
    try {
        _bcrypt = await import('bcryptjs');
        return _bcrypt;
    }
    catch {
        throw new Error('[volqan:password] bcryptjs is not installed. Run: pnpm add bcryptjs');
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
export async function hashPassword(plaintext) {
    if (Buffer.byteLength(plaintext, 'utf8') > MAX_PASSWORD_LENGTH) {
        throw new Error(`Password must not exceed ${MAX_PASSWORD_LENGTH} bytes (bcrypt limit).`);
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
export async function verifyPassword(plaintext, hash) {
    // Sanity guard — reject clearly invalid hashes without calling bcrypt
    if (!hash || !hash.startsWith('$2')) {
        return false;
    }
    const bcrypt = await getBcrypt();
    return bcrypt.compare(plaintext, hash);
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
export function validatePasswordStrength(password) {
    const errors = [];
    const suggestions = [];
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
    if (!hasLower)
        suggestions.push('Add lowercase letters.');
    if (!hasUpper)
        suggestions.push('Add uppercase letters.');
    if (!hasDigit)
        suggestions.push('Add at least one number.');
    if (!hasSpecial)
        suggestions.push('Add a special character (e.g. @, #, !).');
    if (!isLong)
        suggestions.push('Use at least 12 characters for a stronger password.');
    const score = (hasLower ? 1 : 0) +
        (hasUpper ? 1 : 0) +
        (hasDigit ? 1 : 0) +
        (hasSpecial ? 1 : 0) +
        (isLong ? 1 : 0);
    const strengthMap = {
        0: 'weak',
        1: 'weak',
        2: 'fair',
        3: 'strong',
        4: 'strong',
        5: 'very-strong',
    };
    const isTooShort = password.length < MIN_PASSWORD_LENGTH;
    const strength = isTooShort
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
export function isBcryptHash(value) {
    return /^\$2[abxy]\$\d{2}\$/.test(value);
}
//# sourceMappingURL=password.js.map