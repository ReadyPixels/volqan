/**
 * @file media/storage/s3.ts
 * @description S3-compatible storage provider for the Volqan Media Manager.
 *
 * Works with any S3-compatible service:
 * - AWS S3
 * - Cloudflare R2 (set endpoint to your R2 URL)
 * - MinIO (set endpoint to your MinIO URL)
 * - Backblaze B2 (via S3-compatible API)
 *
 * Uses `@aws-sdk/client-s3` for all operations.
 *
 * @example
 * ```ts
 * // AWS S3
 * const storage = new S3StorageProvider({
 *   bucket: 'my-volqan-media',
 *   region: 'us-east-1',
 *   credentials: { accessKeyId: 'KEY', secretAccessKey: 'SECRET' },
 *   publicBaseUrl: 'https://my-volqan-media.s3.us-east-1.amazonaws.com',
 * });
 *
 * // Cloudflare R2
 * const storage = new S3StorageProvider({
 *   bucket: 'my-r2-bucket',
 *   region: 'auto',
 *   endpoint: 'https://<ACCOUNT_ID>.r2.cloudflarestorage.com',
 *   credentials: { accessKeyId: 'CF_KEY', secretAccessKey: 'CF_SECRET' },
 *   publicBaseUrl: 'https://cdn.example.com',
 * });
 * ```
 */
import type { StorageProvider, UploadOptions, UploadResult } from '../types.js';
/** AWS / S3-compatible credentials. */
export interface S3Credentials {
    accessKeyId: string;
    secretAccessKey: string;
    /** Optional session token for temporary credentials. */
    sessionToken?: string;
}
/** Options for the S3StorageProvider. */
export interface S3StorageOptions {
    /** S3 bucket name. */
    bucket: string;
    /** AWS region or "auto" for Cloudflare R2. */
    region: string;
    /** Optional custom endpoint URL (for R2, MinIO, etc.). */
    endpoint?: string;
    /** Static credentials. Use IAM roles in production where possible. */
    credentials: S3Credentials;
    /**
     * Base URL for constructing public file URLs.
     * For public buckets: `https://<bucket>.s3.<region>.amazonaws.com`
     * For Cloudflare R2 with custom domain: `https://cdn.example.com`
     */
    publicBaseUrl: string;
    /**
     * S3 ACL for uploaded objects.
     * Use "public-read" for public buckets, undefined for private (R2/MinIO).
     */
    acl?: 'public-read' | 'private';
    /** Optional key prefix applied to all uploaded files. e.g. "media/" */
    keyPrefix?: string;
}
/**
 * Storage provider backed by any S3-compatible object storage service.
 * Implements the Volqan StorageProvider interface.
 *
 * Lazy-loads `@aws-sdk/client-s3` at runtime so it remains an optional
 * peer dependency — projects using only the LocalStorageProvider do not
 * need to install the AWS SDK.
 */
export declare class S3StorageProvider implements StorageProvider {
    private readonly options;
    private _client;
    constructor(options: S3StorageOptions);
    /**
     * Uploads a file to S3 / S3-compatible storage.
     *
     * @param file File data as a Buffer or Blob.
     * @param originalName Original filename (used for extension).
     * @param mimeType MIME type of the file.
     * @param options Upload options including folder and custom filename.
     */
    upload(file: Buffer | Blob, originalName: string, mimeType: string, options?: UploadOptions): Promise<UploadResult>;
    /**
     * Deletes an object from S3.
     * Silently succeeds if the object does not exist.
     *
     * @param key The full S3 object key returned by `upload`.
     */
    delete(key: string): Promise<void>;
    /**
     * Constructs the public URL for a stored file.
     *
     * @param filename The stored filename.
     * @param folder Optional folder (relative path, no leading slash).
     */
    getUrl(filename: string, folder?: string): string;
    /**
     * Lists all objects in the bucket under an optional prefix.
     *
     * @param folder Optional folder path to list.
     * @returns Array of file metadata objects.
     */
    listFiles(folder?: string): Promise<Array<{
        filename: string;
        key: string;
        size: number;
    }>>;
    /** Lazy-creates and caches the S3Client instance. */
    private _getClient;
    /** Dynamically imports `@aws-sdk/client-s3` at runtime. */
    private _loadSdk;
}
//# sourceMappingURL=s3.d.ts.map