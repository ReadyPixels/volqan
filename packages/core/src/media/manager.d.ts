/**
 * @file media/manager.ts
 * @description MediaManager — the central service for all media operations.
 *
 * Orchestrates file upload, validation, storage, database persistence,
 * folder management, and retrieval. All interactions with media files should
 * go through this class rather than the storage provider directly.
 *
 * @example
 * ```ts
 * const manager = new MediaManager({
 *   prisma,
 *   storage: new LocalStorageProvider({ uploadDir: './public/uploads', baseUrl: 'http://localhost:3000/uploads' }),
 *   imageProcessor: new ImageProcessor(),
 * });
 *
 * // Upload from a Next.js route handler
 * const formData = await request.formData();
 * const file = formData.get('file') as File;
 * const media = await manager.upload(file, { folder: 'blog/heroes' });
 * ```
 */
import type { PrismaClient } from '@prisma/client';
import { type MediaFile, type UploadOptions, type MediaQueryOptions } from './types.js';
import type { StorageProvider } from './types.js';
import type { ImageProcessor } from './image-processor.js';
import type { PaginatedResult } from '../content/types.js';
/** Configuration for the MediaManager. */
export interface MediaManagerOptions {
    /** Prisma client instance for database operations. */
    prisma: PrismaClient;
    /** Storage provider (local or S3). */
    storage: StorageProvider;
    /**
     * Optional image processor for thumbnail generation and dimension extraction.
     * If omitted, thumbnails are not generated and dimensions are not stored.
     */
    imageProcessor?: ImageProcessor;
    /**
     * Maximum allowed file size in bytes.
     * Default: 10 MB (10 * 1024 * 1024).
     */
    maxFileSize?: number;
    /**
     * List of allowed MIME types.
     * Default: all SUPPORTED types defined in media/types.ts.
     */
    allowedMimeTypes?: string[];
}
/**
 * Provides all operations for the Volqan media library.
 */
export declare class MediaManager {
    private readonly prisma;
    private readonly storage;
    private readonly imageProcessor;
    private readonly maxFileSize;
    private readonly allowedMimeTypes;
    constructor(options: MediaManagerOptions);
    /**
     * Uploads a file to storage and creates a Media record in the database.
     *
     * Steps:
     * 1. Validate MIME type is allowed.
     * 2. Validate file size does not exceed the limit.
     * 3. Upload the file via the storage provider.
     * 4. If it's an image: extract dimensions and optionally generate a thumbnail.
     * 5. Persist a Media record to the database.
     *
     * @param file The file to upload — a Web API File object (from FormData),
     *   a Buffer, or a Blob.
     * @param options Upload options.
     * @returns The persisted MediaFile record.
     * @throws {UnsupportedFileTypeError} If the MIME type is not allowed.
     * @throws {FileTooLargeError} If the file exceeds the size limit.
     */
    upload(file: File | Buffer | Blob, options?: UploadOptions): Promise<MediaFile>;
    /**
     * Removes a media file from storage and deletes its database record.
     *
     * @param id The media record ID.
     * @throws {MediaNotFoundError} If the media record does not exist.
     */
    delete(id: string): Promise<void>;
    /**
     * Retrieves a single media record by its primary key.
     *
     * @throws {MediaNotFoundError} If the media record does not exist.
     */
    findById(id: string): Promise<MediaFile>;
    /**
     * Returns a paginated list of media records, with optional filtering.
     *
     * @param options Query and filter options.
     */
    findMany(options?: MediaQueryOptions): Promise<PaginatedResult<MediaFile>>;
    /**
     * Creates a virtual folder entry.
     * Volqan uses "virtual" folders — they are stored as string tags on Media
     * records rather than as actual filesystem directories. This method simply
     * validates the folder path and returns the sanitized name.
     *
     * @param name The folder path to create (e.g. "blog/heroes").
     * @returns The sanitized folder path.
     */
    createFolder(name: string): string;
    /**
     * Moves a media file to a different virtual folder.
     * Updates the `folder` field on the database record and updates the URL
     * if the storage provider supports folder-scoped paths.
     *
     * @param id The media record ID.
     * @param folder The target folder path.
     * @throws {MediaNotFoundError} If the media record does not exist.
     */
    moveToFolder(id: string, folder: string): Promise<MediaFile>;
    private _recordToFile;
    /**
     * Infers the thumbnail storage key from its URL and the original file's key.
     * Returns null if the key cannot be determined.
     */
    private _thumbnailKeyFromUrl;
}
//# sourceMappingURL=manager.d.ts.map