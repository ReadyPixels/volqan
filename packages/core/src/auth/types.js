/**
 * @file auth/types.ts
 * @description Core type definitions for the Volqan authentication system.
 *
 * These types are shared across JWT, session, OAuth, and middleware modules.
 */
/**
 * Structured error thrown by auth operations.
 */
export class AuthError extends Error {
    code;
    statusCode;
    constructor(code, message, statusCode = 401) {
        super(message);
        this.name = 'AuthError';
        this.code = code;
        this.statusCode = statusCode;
    }
}
//# sourceMappingURL=types.js.map