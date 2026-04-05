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
import {
  ALL_SUPPORTED_TYPES,
  DEFAULT_MAX_FILE_SIZE,
  FileTooLargeError,
  UnsupportedFileTypeError,
  MediaNotFoundError,
  type MediaFile,
  type UploadOptions,
  type MediaQueryOptions,
} from './types.js';
import type { StorageProvider } from './types.js';
import type { ImageProcessor } from './image-processor.js';
import { isProcessableImage } from './image-processor.js';
import type { PaginatedResult } from '../content/types.js';

// ---------------------------------------------------------------------------
// Manager options
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// MediaManager
// ---------------------------------------------------------------------------

/**
 * Provides all operations for the Volqan media library.
 */
export class MediaManager {
  private readonly prisma: PrismaClient;
  private readonly storage: StorageProvider;
  private readonly imageProcessor: ImageProcessor | undefined;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: Set<string>;

  constructor(options: MediaManagerOptions) {
    this.prisma = options.prisma;
    this.storage = options.storage;
    this.imageProcessor = options.imageProcessor;
    this.maxFileSize = options.maxFileSize ?? DEFAULT_MAX_FILE_SIZE;
    this.allowedMimeTypes = new Set(
      options.allowedMimeTypes ?? (ALL_SUPPORTED_TYPES as unknown as string[]),
    );
  }

  // -------------------------------------------------------------------------
  // Upload
  // -------------------------------------------------------------------------

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
  async upload(file: File | Buffer | Blob, options: UploadOptions = {}): Promise<MediaFile> {
    // Normalise the input to buffer + metadata
    let buffer: Buffer;
    let originalName: string;
    let mimeType: string;
    let fileSize: number;

    if (file instanceof File) {
      originalName = file.name;
      mimeType = file.type;
      buffer = Buffer.from(await file.arrayBuffer());
      fileSize = buffer.length;
    } else if (file instanceof Blob) {
      originalName = 'upload';
      mimeType = file.type || 'application/octet-stream';
      buffer = Buffer.from(await file.arrayBuffer());
      fileSize = buffer.length;
    } else {
      // Buffer
      buffer = file;
      originalName = options.filename ?? 'upload';
      mimeType = detectMimeType(buffer, originalName);
      fileSize = buffer.length;
    }

    // Validate type
    if (!this.allowedMimeTypes.has(mimeType)) {
      throw new UnsupportedFileTypeError(mimeType);
    }

    // Validate size
    const maxSize = options.maxSize ?? this.maxFileSize;
    if (fileSize > maxSize) {
      throw new FileTooLargeError(fileSize, maxSize);
    }

    // Upload to storage
    const uploadResult = await this.storage.upload(buffer, originalName, mimeType, options);

    // Image processing
    let width: number | null = null;
    let height: number | null = null;
    let thumbnailUrl: string | null = null;

    if (this.imageProcessor && isProcessableImage(mimeType)) {
      try {
        const dims = await this.imageProcessor.getImageDimensions(buffer);
        width = dims.width;
        height = dims.height;

        if (options.generateThumbnail !== false) {
          const thumbBuffer = await this.imageProcessor.generateThumbnail(buffer, {
            width: 300,
            height: 300,
            fit: 'cover',
            format: 'webp',
            quality: 80,
          });

          const thumbResult = await this.storage.upload(
            thumbBuffer,
            `thumb_${uploadResult.filename}`,
            'image/webp',
            { folder: options.folder, filename: `thumb_${uploadResult.filename.replace(/\.[^.]+$/, '')}` },
          );

          thumbnailUrl = thumbResult.url;
        }
      } catch (err) {
        // Image processing failure should not abort the upload
        console.warn('[MediaManager] Image processing failed:', err);
      }
    }

    // Persist to database
    const record = await this.prisma.media.create({
      data: {
        filename: uploadResult.filename,
        originalName,
        mimeType,
        size: fileSize,
        url: uploadResult.url,
        thumbnailUrl,
        width,
        height,
        folder: options.folder ?? null,
        alt: options.alt ?? null,
        caption: options.caption ?? null,
        storageKey: uploadResult.key,
      } as Record<string, unknown>,
    });

    return this._recordToFile(record);
  }

  // -------------------------------------------------------------------------
  // Delete
  // -------------------------------------------------------------------------

  /**
   * Removes a media file from storage and deletes its database record.
   *
   * @param id The media record ID.
   * @throws {MediaNotFoundError} If the media record does not exist.
   */
  async delete(id: string): Promise<void> {
    const record = await this.prisma.media.findUnique({ where: { id } });
    if (!record) throw new MediaNotFoundError(id);

    const storageKey = (record as Record<string, unknown>)['storageKey'] as string | null;

    // Delete from storage (best effort — don't abort if storage deletion fails)
    if (storageKey) {
      try {
        await this.storage.delete(storageKey);
      } catch (err) {
        console.warn(`[MediaManager] Storage deletion failed for key "${storageKey}":`, err);
      }
    }

    // Also delete thumbnail if one exists
    if (record.thumbnailUrl) {
      try {
        const thumbKey = this._thumbnailKeyFromUrl(record.thumbnailUrl, storageKey);
        if (thumbKey) await this.storage.delete(thumbKey);
      } catch {
        // Non-fatal
      }
    }

    // Remove database record
    await this.prisma.media.delete({ where: { id } });
  }

  // -------------------------------------------------------------------------
  // Find
  // -------------------------------------------------------------------------

  /**
   * Retrieves a single media record by its primary key.
   *
   * @throws {MediaNotFoundError} If the media record does not exist.
   */
  async findById(id: string): Promise<MediaFile> {
    const record = await this.prisma.media.findUnique({ where: { id } });
    if (!record) throw new MediaNotFoundError(id);
    return this._recordToFile(record);
  }

  /**
   * Returns a paginated list of media records, with optional filtering.
   *
   * @param options Query and filter options.
   */
  async findMany(options: MediaQueryOptions = {}): Promise<PaginatedResult<MediaFile>> {
    const page = Math.max(1, options.page ?? 1);
    const perPage = Math.min(100, Math.max(1, options.perPage ?? 20));
    const skip = (page - 1) * perPage;

    const where: Record<string, unknown> = {};
    if (options.folder !== undefined) where.folder = options.folder;
    if (options.mimeType) {
      where.mimeType = { startsWith: options.mimeType };
    }
    if (options.search) {
      where.originalName = { contains: options.search, mode: 'insensitive' };
    }

    const sortField = options.sortBy ?? 'createdAt';
    const sortDir = options.sortDirection ?? 'desc';
    const orderBy: Record<string, unknown> = { [sortField]: sortDir };

    const [records, total] = await Promise.all([
      this.prisma.media.findMany({ where, orderBy, skip, take: perPage }),
      this.prisma.media.count({ where }),
    ]);

    return {
      data: records.map((r: any) => this._recordToFile(r)),
      meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
    };
  }

  // -------------------------------------------------------------------------
  // Folder operations
  // -------------------------------------------------------------------------

  /**
   * Creates a virtual folder entry.
   * Volqan uses "virtual" folders — they are stored as string tags on Media
   * records rather than as actual filesystem directories. This method simply
   * validates the folder path and returns the sanitized name.
   *
   * @param name The folder path to create (e.g. "blog/heroes").
   * @returns The sanitized folder path.
   */
  createFolder(name: string): string {
    const sanitized = name
      .replace(/\.\./g, '')
      .replace(/^\/+|\/+$/g, '')
      .replace(/[^a-zA-Z0-9/_-]/g, '');

    if (!sanitized) {
      throw new Error('Invalid folder name');
    }

    return sanitized;
  }

  /**
   * Moves a media file to a different virtual folder.
   * Updates the `folder` field on the database record and updates the URL
   * if the storage provider supports folder-scoped paths.
   *
   * @param id The media record ID.
   * @param folder The target folder path.
   * @throws {MediaNotFoundError} If the media record does not exist.
   */
  async moveToFolder(id: string, folder: string): Promise<MediaFile> {
    const record = await this.prisma.media.findUnique({ where: { id } });
    if (!record) throw new MediaNotFoundError(id);

    const sanitizedFolder = this.createFolder(folder);

    const updated = await this.prisma.media.update({
      where: { id },
      data: { folder: sanitizedFolder } as Record<string, unknown>,
    });

    return this._recordToFile(updated);
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private _recordToFile(record: Record<string, unknown>): MediaFile {
    return {
      id: record['id'] as string,
      filename: record['filename'] as string,
      originalName: record['originalName'] as string,
      mimeType: record['mimeType'] as string,
      size: record['size'] as number,
      url: record['url'] as string,
      thumbnailUrl: (record['thumbnailUrl'] as string | null) ?? null,
      width: (record['width'] as number | null) ?? null,
      height: (record['height'] as number | null) ?? null,
      folder: (record['folder'] as string | null) ?? null,
      alt: (record['alt'] as string | null) ?? null,
      caption: (record['caption'] as string | null) ?? null,
      createdAt: record['createdAt'] as Date,
      updatedAt: record['updatedAt'] as Date,
    };
  }

  /**
   * Infers the thumbnail storage key from its URL and the original file's key.
   * Returns null if the key cannot be determined.
   */
  private _thumbnailKeyFromUrl(thumbnailUrl: string, originalKey: string | null): string | null {
    if (!originalKey) return null;
    const dir = originalKey.includes('/') ? originalKey.substring(0, originalKey.lastIndexOf('/') + 1) : '';
    const thumbFilename = thumbnailUrl.split('/').pop();
    if (!thumbFilename) return null;
    return dir + thumbFilename;
  }
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Attempts to detect the MIME type from a Buffer by inspecting magic bytes.
 * Falls back to "application/octet-stream" if the type cannot be determined.
 */
function detectMimeType(buffer: Buffer, filename: string): string {
  // Check magic bytes
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return 'image/jpeg';
  if (buffer[0] === 0x89 && buffer.slice(1, 4).toString() === 'PNG') return 'image/png';
  if (buffer.slice(0, 6).toString() === 'GIF87a' || buffer.slice(0, 6).toString() === 'GIF89a') return 'image/gif';
  if (buffer.slice(0, 4).toString('hex') === '52494646') return 'image/webp'; // RIFF
  if (buffer.slice(0, 4).toString('hex') === '25504446') return 'application/pdf'; // %PDF

  // Fall back to extension
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const extMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };

  return extMap[ext] ?? 'application/octet-stream';
}
