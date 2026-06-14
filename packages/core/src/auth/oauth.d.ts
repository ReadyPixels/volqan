/**
 * @file auth/oauth.ts
 * @description OAuth 2.0 provider abstraction for Google and GitHub.
 *
 * Each provider implements a common interface:
 * - `getAuthorizationUrl()` — generate the OAuth redirect URL
 * - `exchangeCode()` — exchange an authorization code for tokens
 * - `getUserProfile()` — fetch and normalize the user profile
 *
 * @example
 * ```ts
 * import { GoogleProvider, GitHubProvider } from '@volqan/core/auth';
 *
 * const google = new GoogleProvider({
 *   clientId: process.env.GOOGLE_CLIENT_ID!,
 *   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
 *   redirectUri: 'https://example.com/auth/callback/google',
 * });
 *
 * // Step 1: redirect user
 * const { url, state } = google.getAuthorizationUrl();
 * redirect(url);
 *
 * // Step 2: handle callback
 * const profile = await google.exchangeCode(code);
 * ```
 */
import type { OAuthProfile, OAuthProviderName } from './types.js';
/**
 * Common configuration accepted by all OAuth providers.
 */
export interface OAuthProviderConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    /** Additional OAuth scopes to request beyond the defaults */
    extraScopes?: string[];
}
/**
 * Result of generating an authorization URL.
 */
export interface AuthorizationResult {
    /** Full URL the user should be redirected to */
    url: string;
    /** CSRF state parameter — store in session and verify on callback */
    state: string;
}
/**
 * Raw token response from an OAuth token endpoint.
 */
export interface TokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
}
/**
 * Abstract base class defining the OAuth provider contract.
 */
export declare abstract class OAuthProvider {
    readonly name: OAuthProviderName;
    protected config: OAuthProviderConfig;
    constructor(name: OAuthProviderName, config: OAuthProviderConfig);
    /**
     * Generates a cryptographically random state parameter.
     */
    protected generateState(): string;
    /**
     * Builds the authorization URL for this provider.
     * @returns URL and state to store in session
     */
    abstract getAuthorizationUrl(opts?: {
        state?: string;
    }): AuthorizationResult;
    /**
     * Exchanges an authorization code for a normalised {@link OAuthProfile}.
     * This is a single step combining token exchange + profile fetch.
     *
     * @param code - The code received in the callback query string
     * @returns Normalized {@link OAuthProfile}
     */
    abstract exchangeCode(code: string): Promise<OAuthProfile>;
    /**
     * Fetches and normalizes the user profile using a valid access token.
     *
     * @param accessToken - A valid access token for this provider
     * @returns Normalized {@link OAuthProfile}
     */
    abstract getUserProfile(accessToken: string): Promise<OAuthProfile>;
    /**
     * Helper: performs a token endpoint POST request.
     */
    protected fetchTokens(tokenEndpoint: string, code: string): Promise<TokenResponse>;
    /**
     * Helper: performs an authenticated GET request to a provider API.
     */
    protected fetchProfile<T>(url: string, accessToken: string, headers?: Record<string, string>): Promise<T>;
}
/**
 * Google OAuth 2.0 provider.
 *
 * @example
 * ```ts
 * const google = new GoogleProvider({
 *   clientId: process.env.GOOGLE_CLIENT_ID!,
 *   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
 *   redirectUri: 'https://myapp.com/auth/callback/google',
 * });
 * ```
 */
export declare class GoogleProvider extends OAuthProvider {
    constructor(config: OAuthProviderConfig);
    getAuthorizationUrl(opts?: {
        state?: string;
    }): AuthorizationResult;
    exchangeCode(code: string): Promise<OAuthProfile>;
    getUserProfile(accessToken: string, tokens?: TokenResponse): Promise<OAuthProfile>;
}
/**
 * GitHub OAuth 2.0 provider.
 *
 * @example
 * ```ts
 * const github = new GitHubProvider({
 *   clientId: process.env.GITHUB_CLIENT_ID!,
 *   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
 *   redirectUri: 'https://myapp.com/auth/callback/github',
 * });
 * ```
 */
export declare class GitHubProvider extends OAuthProvider {
    constructor(config: OAuthProviderConfig);
    getAuthorizationUrl(opts?: {
        state?: string;
    }): AuthorizationResult;
    exchangeCode(code: string): Promise<OAuthProfile>;
    getUserProfile(accessToken: string, tokens?: TokenResponse): Promise<OAuthProfile>;
}
/**
 * Creates an OAuth provider instance by name.
 *
 * @param name - Provider identifier
 * @param config - Provider credentials and redirect URI
 */
export declare function createProvider(name: OAuthProviderName, config: OAuthProviderConfig): OAuthProvider;
//# sourceMappingURL=oauth.d.ts.map