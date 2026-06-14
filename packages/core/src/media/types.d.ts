/**
 * @file media/types.ts
 * @description Type definitions for the Volqan Media Manager.
 *
 * Covers uploaded file metadata, storage provider interfaces,
 * upload options, and query helpers for browsing the media library.
 */
/**
 * A media file record as stored in the database and returned by the API.
 * Maps to the `Media` Prisma model.
 */
export interface MediaFile {
    /** Primary key (CUID). */
    id: string;
    /** The stored filename on the provider (may include a UUID prefix). */
    filename: string;
    /** The original filename supplied by the user at upload time. */
    originalName: string;
    /** MIME type of the file (e.g. "image/png"). */
    mimeType: string;
    /** File size in bytes. */
    size: number;
    /** Publicly accessible URL to the file. */
    url: string;
    /** URL of the generated thumbnail (images only). */
    thumbnailUrl: string | null;
    /** Image width in pixels (images only). */
    width: number | null;
    /** Image height in pixels (images only). */
    height: number | null;
    /** Virtual folder path (e.g. "blog/heroes"). */
    folder: string | null;
    /** Optional alt text for accessibility. */
    alt: string | null;
    /** Optional human-readable caption. */
    caption: string | null;
    /** Timestamp of upload. */
    createdAt: Date;
    /** Timestamp of last metadata update. */
    updatedAt: Date;
}
/**
 * Options that can be passed when uploading a file.
 */
export interface UploadOptions {
    /** Target virtual folder (e.g. "blog/heroes"). Defaults to root. */
    folder?: string;
    /** Override the stored filename (without extension). */
    filename?: string;
    /** Alt text for image accessibility. */
    alt?: string;
    /** Human-readable caption for the image. */
    caption?: string;
    /** When true, generate a thumbnail for image files. Default true. */
    generateThumbnail?: boolean;
    /** Maximum allowed file size in bytes. Overrides the global default. */
    maxSize?: number;
}
/** Result returned by a successful upload operation. */
export interface UploadResult {
    /** The stored filename (may differ from the original). */
    filename: string;
    /** Full public URL to access the file. */
    url: string;
    /** The storage key / path within the provider's storage. */
    key: string;
}
/**
 * Abstract interface implemented by all Volqan storage backends.
 *
 * Implementing a custom provider:
 * ```ts
 * class MyProvider implements StorageProvider {
 *   async upload(file, options) { ... }
 *   async delete(key) { ... }
 *   getUrl(filename) { ... }
 *   async listFiles(folder) { ... }
 * }
 * ```
 */
export interface StorageProvider {
    /**
     * Uploads a file buffer to the backing storage.
     *
     * @param file The file data as a Buffer or Blob.
     * @param originalName The original filename (used to determine the extension).
     * @param mimeType The MIME type of the file.
     * @param options Additional upload options (folder, custom filename, etc.).
     * @returns Metadata about the stored file.
     */
    upload(file: Buffer | Blob, originalName: string, mimeType: string, options?: UploadOptions): Promise<UploadResult>;
    /**
     * Permanently removes a file from storage.
     *
     * @param key The storage key returned by a previous `upload` call.
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
     * Lists all files stored under an optional folder path.
     *
     * @param folder Optional folder prefix to filter by.
     */
    listFiles(folder?: string): Promise<Array<{
        filename: string;
        key: string;
        size: number;
    }>>;
}
/**
 * Options for filtering and paginating the media library.
 */
export interface MediaQueryOptions {
    /** Filter by virtual folder path. */
    folder?: string;
    /** Filter by MIME type prefix (e.g. "image/", "video/"). */
    mimeType?: string;
    /** 1-based page number. */
    page?: number;
    /** Items per page (default 20). */
    perPage?: number;
    /** Search by original filename (partial match). */
    search?: string;
    /** Sort field: "createdAt" | "size" | "originalName". Default: "createdAt". */
    sortBy?: 'createdAt' | 'size' | 'originalName';
    /** Sort direction. Default: "desc". */
    sortDirection?: 'asc' | 'desc';
}
/** Supported image MIME types. */
export declare const SUPPORTED_IMAGE_TYPES: readonly ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
/** Supported document MIME types. */
export declare const SUPPORTED_DOCUMENT_TYPES: readonly ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
/** Supported video MIME types. */
export declare const SUPPORTED_VIDEO_TYPES: readonly ["video/mp4", "video/webm"];
/** Supported audio MIME types. */
export declare const SUPPORTED_AUDIO_TYPES: readonly ["audio/mpeg", "audio/wav"];
/** All supported MIME types combined. */
export declare const ALL_SUPPORTED_TYPES: readonly ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "video/mp4", "video/webm", "audio/mpeg", "audio/wav"];
export type SupportedMimeType = (typeof ALL_SUPPORTED_TYPES)[number];
/** Default maximum file size: 10 MB */
export declare const DEFAULT_MAX_FILE_SIZE: number;
/** Thrown when an uploaded file exceeds the size limit. */
export declare class FileTooLargeError extends Error {
    constructor(sizeBytes: number, maxBytes: number);
}
/** Thrown when an uploaded file type is not allowed. */
export declare class UnsupportedFileTypeError extends Error {
    constructor(mimeType: string);
}
/** Thrown when a media record cannot be found. */
export declare class MediaNotFoundError extends Error {
    constructor(id: string);
}
//# sourceMappingURL=types.d.ts.map