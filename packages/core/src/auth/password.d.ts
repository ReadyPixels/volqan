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
/**
 * Hashes a plain-text password using bcrypt.
 *
 * @param plaintext - The raw password string provided by the user
 * @returns bcrypt hash string (60 characters)
 * @throws {Error} if the password exceeds 72 bytes (bcrypt silent truncation risk)
 */
export declare function hashPassword(plaintext: string): Promise<string>;
/**
 * Verifies a plain-text password against a stored bcrypt hash.
 *
 * Performs a constant-time comparison to mitigate timing attacks.
 *
 * @param plaintext - The raw password provided during login
 * @param hash - The stored bcrypt hash from the database
 * @returns `true` if the password matches, `false` otherwise
 */
export declare function verifyPassword(plaintext: string, hash: string): Promise<boolean>;
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
export declare function validatePasswordStrength(password: string): PasswordStrengthResult;
/**
 * Checks whether a value looks like a bcrypt hash without verifying it.
 * Useful for defensive checks before storing or comparing hashes.
 *
 * @param value - String to test
 */
export declare function isBcryptHash(value: string): boolean;
//# sourceMappingURL=password.d.ts.map