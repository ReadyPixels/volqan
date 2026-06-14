/**
 * @file media/storage/local.ts
 * @description Local filesystem storage provider for the Volqan Media Manager.
 *
 * Files are saved to a configurable directory on the local filesystem.
 * The public URL is constructed from a configurable base URL.
 *
 * This provider is suitable for development and single-server deployments.
 * For production with multiple nodes or serverless environments, use the
 * S3StorageProvider instead.
 *
 * @example
 * ```ts
 * const storage = new LocalStorageProvider({
 *   uploadDir: './public/uploads',
 *   baseUrl: 'http://localhost:3000/uploads',
 * });
 *
 * const result = await storage.upload(buffer, 'photo.jpg', 'image/jpeg');
 * console.log(result.url); // http://localhost:3000/uploads/photo-abc123.jpg
 * ```
 */
import type { StorageProvider, UploadOptions, UploadResult } from '../types.js';
/** Options for the LocalStorageProvider. */
export interface LocalStorageOptions {
    /**
     * Absolute or relative path to the directory where files will be stored.
     * The directory and any necessary sub-directories are created automatically.
     */
    uploadDir: string;
    /**
     * Base URL prefix used to construct public file URLs.
     * e.g. "http://localhost:3000/uploads" or "https://example.com/media"
     */
    baseUrl: string;
}
/**
 * Storage provider that persists files to the local filesystem.
 * Implements the Volqan StorageProvider interface.
 */
export declare class LocalStorageProvider implements StorageProvider {
    private readonly uploadDir;
    private readonly baseUrl;
    constructor(options: LocalStorageOptions);
    /**
     * Saves a file buffer to the local filesystem.
     *
     * The stored filename is `{customName|slugifiedOriginal}-{shortUuid}.{ext}`
     * to guarantee uniqueness. Files are placed inside a subdirectory matching
     * `options.folder` (e.g. `uploadDir/blog/heroes/photo-abc.jpg`).
     *
     * @param file File data as a Buffer or Blob.
     * @param originalName Original filename (used for extension extraction).
     * @param mimeType MIME type of the file.
     * @param options Upload options including folder and custom filename.
     */
    upload(file: Buffer | Blob, originalName: string, _mimeType: string, options?: UploadOptions): Promise<UploadResult>;
    /**
     * Removes a file from the local filesystem.
     * Silently succeeds if the file does not exist (idempotent).
     *
     * @param key The storage key returned by `upload`.
     */
    delete(key: string): Promise<void>;
    /**
     * Constructs the public URL for a stored file.
     *
     * @param filename The stored filename.
     * @param folder Optional folder prefix.
     */
    getUrl(filename: string, folder?: string): string;
    /**
     * Lists all files in the upload directory (or a subfolder).
     *
     * @param folder Optional folder path to list (relative to uploadDir).
     * @returns Array of file metadata objects.
     */
    listFiles(folder?: string): Promise<Array<{
        filename: string;
        key: string;
        size: number;
    }>>;
    /**
     * Returns the absolute filesystem path for a stored file key.
     * Useful for reading the file for image processing.
     */
    getFilePath(key: string): string;
}
//# sourceMappingURL=local.d.ts.map