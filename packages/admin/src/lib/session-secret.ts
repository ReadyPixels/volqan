/**
 * Returns the SESSION_SECRET, throwing an error if it is not set in production.
 * In non-production environments, falls back to a development-only default.
 * Never use the development default in production — it would allow token forgery.
 */
export function getRequiredSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'SESSION_SECRET environment variable is required in production. ' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
    );
  }
  return 'dev-session-secret';
}
