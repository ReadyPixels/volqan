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
import crypto from 'node:crypto';
import path from 'node:path';
// ---------------------------------------------------------------------------
// S3StorageProvider
// ---------------------------------------------------------------------------
/**
 * Storage provider backed by any S3-compatible object storage service.
 * Implements the Volqan StorageProvider interface.
 *
 * Lazy-loads `@aws-sdk/client-s3` at runtime so it remains an optional
 * peer dependency — projects using only the LocalStorageProvider do not
 * need to install the AWS SDK.
 */
export class S3StorageProvider {
    options;
    _client = null;
    constructor(options) {
        this.options = {
            ...options,
            publicBaseUrl: options.publicBaseUrl.replace(/\/$/, ''),
            keyPrefix: options.keyPrefix?.replace(/^\/|\/$/g, '') ?? '',
        };
    }
    // -------------------------------------------------------------------------
    // Upload
    // -------------------------------------------------------------------------
    /**
     * Uploads a file to S3 / S3-compatible storage.
     *
     * @param file File data as a Buffer or Blob.
     * @param originalName Original filename (used for extension).
     * @param mimeType MIME type of the file.
     * @param options Upload options including folder and custom filename.
     */
    async upload(file, originalName, mimeType, options) {
        const { S3Client, PutObjectCommand } = await this._loadSdk();
        const ext = path.extname(originalName).toLowerCase();
        const baseName = options?.filename
            ? slugify(options.filename)
            : slugify(path.basename(originalName, ext));
        const uid = crypto.randomBytes(6).toString('hex');
        const filename = `${baseName}-${uid}${ext}`;
        const folder = options?.folder ? sanitizeFolderPath(options.folder) : '';
        const keyParts = [this.options.keyPrefix, folder, filename].filter(Boolean);
        const key = keyParts.join('/');
        const buffer = file instanceof Blob ? Buffer.from(await file.arrayBuffer()) : file;
        const client = await this._getClient();
        const commandInput = {
            Bucket: this.options.bucket,
            Key: key,
            Body: buffer,
            ContentType: mimeType,
            ContentLength: buffer.length,
            ...(this.options.acl ? { ACL: this.options.acl } : {}),
        };
        const command = new PutObjectCommand(commandInput);
        await client.send(command);
        return {
            filename,
            url: this.getUrl(filename, folder),
            key,
        };
    }
    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------
    /**
     * Deletes an object from S3.
     * Silently succeeds if the object does not exist.
     *
     * @param key The full S3 object key returned by `upload`.
     */
    async delete(key) {
        const { S3Client, DeleteObjectCommand } = await this._loadSdk();
        const client = await this._getClient();
        const commandInput = {
            Bucket: this.options.bucket,
            Key: key,
        };
        const command = new DeleteObjectCommand(commandInput);
        await client.send(command);
    }
    // -------------------------------------------------------------------------
    // URL
    // -------------------------------------------------------------------------
    /**
     * Constructs the public URL for a stored file.
     *
     * @param filename The stored filename.
     * @param folder Optional folder (relative path, no leading slash).
     */
    getUrl(filename, folder) {
        const parts = [this.options.publicBaseUrl];
        if (this.options.keyPrefix)
            parts.push(this.options.keyPrefix);
        if (folder)
            parts.push(sanitizeFolderPath(folder));
        parts.push(filename);
        return parts.join('/');
    }
    // -------------------------------------------------------------------------
    // List
    // -------------------------------------------------------------------------
    /**
     * Lists all objects in the bucket under an optional prefix.
     *
     * @param folder Optional folder path to list.
     * @returns Array of file metadata objects.
     */
    async listFiles(folder) {
        const { S3Client, ListObjectsV2Command } = await this._loadSdk();
        const client = await this._getClient();
        const prefixParts = [this.options.keyPrefix, folder ? sanitizeFolderPath(folder) : '']
            .filter(Boolean);
        const prefix = prefixParts.length > 0 ? prefixParts.join('/') + '/' : '';
        const commandInput = {
            Bucket: this.options.bucket,
            Prefix: prefix || undefined,
            MaxKeys: 1000,
        };
        const command = new ListObjectsV2Command(commandInput);
        const response = await client.send(command);
        return (response.Contents ?? []).map((obj) => {
            const key = obj.Key ?? '';
            const filename = key.split('/').pop() ?? key;
            return {
                filename,
                key,
                size: obj.Size ?? 0,
            };
        });
    }
    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------
    /** Lazy-creates and caches the S3Client instance. */
    async _getClient() {
        if (this._client)
            return this._client;
        const { S3Client } = await this._loadSdk();
        this._client = new S3Client({
            region: this.options.region,
            endpoint: this.options.endpoint,
            credentials: {
                accessKeyId: this.options.credentials.accessKeyId,
                secretAccessKey: this.options.credentials.secretAccessKey,
                ...(this.options.credentials.sessionToken
                    ? { sessionToken: this.options.credentials.sessionToken }
                    : {}),
            },
            // Required for path-style addressing (MinIO) or R2
            forcePathStyle: !!this.options.endpoint,
        });
        return this._client;
    }
    /** Dynamically imports `@aws-sdk/client-s3` at runtime. */
    async _loadSdk() {
        try {
            return await import('@aws-sdk/client-s3');
        }
        catch {
            throw new Error('S3StorageProvider requires @aws-sdk/client-s3 to be installed. ' +
                'Run: pnpm add @aws-sdk/client-s3');
        }
    }
}
// ---------------------------------------------------------------------------
// Private utilities
// ---------------------------------------------------------------------------
function slugify(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 60);
}
function sanitizeFolderPath(folder) {
    return folder
        .replace(/\.\./g, '')
        .replace(/^\/+/, '')
        .replace(/\/+$/, '')
        .replace(/[^a-zA-Z0-9/_-]/g, '');
}
//# sourceMappingURL=s3.js.map