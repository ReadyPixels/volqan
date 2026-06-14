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
import { ALL_SUPPORTED_TYPES, DEFAULT_MAX_FILE_SIZE, FileTooLargeError, UnsupportedFileTypeError, MediaNotFoundError, } from './types.js';
import { isProcessableImage } from './image-processor.js';
// ---------------------------------------------------------------------------
// MediaManager
// ---------------------------------------------------------------------------
/**
 * Provides all operations for the Volqan media library.
 */
export class MediaManager {
    prisma;
    storage;
    imageProcessor;
    maxFileSize;
    allowedMimeTypes;
    constructor(options) {
        this.prisma = options.prisma;
        this.storage = options.storage;
        this.imageProcessor = options.imageProcessor;
        this.maxFileSize = options.maxFileSize ?? DEFAULT_MAX_FILE_SIZE;
        this.allowedMimeTypes = new Set(options.allowedMimeTypes ?? ALL_SUPPORTED_TYPES);
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
    async upload(file, options = {}) {
        // Normalise the input to buffer + metadata
        let buffer;
        let originalName;
        let mimeType;
        let fileSize;
        if (file instanceof File) {
            originalName = file.name;
            mimeType = file.type;
            buffer = Buffer.from(await file.arrayBuffer());
            fileSize = buffer.length;
        }
        else if (file instanceof Blob) {
            originalName = 'upload';
            mimeType = file.type || 'application/octet-stream';
            buffer = Buffer.from(await file.arrayBuffer());
            fileSize = buffer.length;
        }
        else {
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
        let width = null;
        let height = null;
        let thumbnailUrl = null;
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
                    const thumbResult = await this.storage.upload(thumbBuffer, `thumb_${uploadResult.filename}`, 'image/webp', { folder: options.folder, filename: `thumb_${uploadResult.filename.replace(/\.[^.]+$/, '')}` });
                    thumbnailUrl = thumbResult.url;
                }
            }
            catch (err) {
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
            },
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
    async delete(id) {
        const record = await this.prisma.media.findUnique({ where: { id } });
        if (!record)
            throw new MediaNotFoundError(id);
        const storageKey = record['storageKey'];
        // Delete from storage (best effort — don't abort if storage deletion fails)
        if (storageKey) {
            try {
                await this.storage.delete(storageKey);
            }
            catch (err) {
                console.warn(`[MediaManager] Storage deletion failed for key "${storageKey}":`, err);
            }
        }
        // Also delete thumbnail if one exists
        if (record.thumbnailUrl) {
            try {
                const thumbKey = this._thumbnailKeyFromUrl(record.thumbnailUrl, storageKey);
                if (thumbKey)
                    await this.storage.delete(thumbKey);
            }
            catch {
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
    async findById(id) {
        const record = await this.prisma.media.findUnique({ where: { id } });
        if (!record)
            throw new MediaNotFoundError(id);
        return this._recordToFile(record);
    }
    /**
     * Returns a paginated list of media records, with optional filtering.
     *
     * @param options Query and filter options.
     */
    async findMany(options = {}) {
        const page = Math.max(1, options.page ?? 1);
        const perPage = Math.min(100, Math.max(1, options.perPage ?? 20));
        const skip = (page - 1) * perPage;
        const where = {};
        if (options.folder !== undefined)
            where.folder = options.folder;
        if (options.mimeType) {
            where.mimeType = { startsWith: options.mimeType };
        }
        if (options.search) {
            where.originalName = { contains: options.search, mode: 'insensitive' };
        }
        const sortField = options.sortBy ?? 'createdAt';
        const sortDir = options.sortDirection ?? 'desc';
        const orderBy = { [sortField]: sortDir };
        const [records, total] = await Promise.all([
            this.prisma.media.findMany({ where, orderBy, skip, take: perPage }),
            this.prisma.media.count({ where }),
        ]);
        return {
            data: records.map((r) => this._recordToFile(r)),
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
    createFolder(name) {
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
    async moveToFolder(id, folder) {
        const record = await this.prisma.media.findUnique({ where: { id } });
        if (!record)
            throw new MediaNotFoundError(id);
        const sanitizedFolder = this.createFolder(folder);
        const updated = await this.prisma.media.update({
            where: { id },
            data: { folder: sanitizedFolder },
        });
        return this._recordToFile(updated);
    }
    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------
    _recordToFile(record) {
        return {
            id: record['id'],
            filename: record['filename'],
            originalName: record['originalName'],
            mimeType: record['mimeType'],
            size: record['size'],
            url: record['url'],
            thumbnailUrl: record['thumbnailUrl'] ?? null,
            width: record['width'] ?? null,
            height: record['height'] ?? null,
            folder: record['folder'] ?? null,
            alt: record['alt'] ?? null,
            caption: record['caption'] ?? null,
            createdAt: record['createdAt'],
            updatedAt: record['updatedAt'],
        };
    }
    /**
     * Infers the thumbnail storage key from its URL and the original file's key.
     * Returns null if the key cannot be determined.
     */
    _thumbnailKeyFromUrl(thumbnailUrl, originalKey) {
        if (!originalKey)
            return null;
        const dir = originalKey.includes('/') ? originalKey.substring(0, originalKey.lastIndexOf('/') + 1) : '';
        const thumbFilename = thumbnailUrl.split('/').pop();
        if (!thumbFilename)
            return null;
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
function detectMimeType(buffer, filename) {
    // Check magic bytes
    if (buffer[0] === 0xff && buffer[1] === 0xd8)
        return 'image/jpeg';
    if (buffer[0] === 0x89 && buffer.slice(1, 4).toString() === 'PNG')
        return 'image/png';
    if (buffer.slice(0, 6).toString() === 'GIF87a' || buffer.slice(0, 6).toString() === 'GIF89a')
        return 'image/gif';
    if (buffer.slice(0, 4).toString('hex') === '52494646')
        return 'image/webp'; // RIFF
    if (buffer.slice(0, 4).toString('hex') === '25504446')
        return 'application/pdf'; // %PDF
    // Fall back to extension
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';
    const extMap = {
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
//# sourceMappingURL=manager.js.map