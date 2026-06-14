/**
 * @file media/types.ts
 * @description Type definitions for the Volqan Media Manager.
 *
 * Covers uploaded file metadata, storage provider interfaces,
 * upload options, and query helpers for browsing the media library.
 */
// ---------------------------------------------------------------------------
// Supported file types
// ---------------------------------------------------------------------------
/** Supported image MIME types. */
export const SUPPORTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
];
/** Supported document MIME types. */
export const SUPPORTED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
/** Supported video MIME types. */
export const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
/** Supported audio MIME types. */
export const SUPPORTED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav'];
/** All supported MIME types combined. */
export const ALL_SUPPORTED_TYPES = [
    ...SUPPORTED_IMAGE_TYPES,
    ...SUPPORTED_DOCUMENT_TYPES,
    ...SUPPORTED_VIDEO_TYPES,
    ...SUPPORTED_AUDIO_TYPES,
];
/** Default maximum file size: 10 MB */
export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;
// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------
/** Thrown when an uploaded file exceeds the size limit. */
export class FileTooLargeError extends Error {
    constructor(sizeBytes, maxBytes) {
        super(`File size ${sizeBytes} bytes exceeds the maximum allowed size of ${maxBytes} bytes`);
        this.name = 'FileTooLargeError';
    }
}
/** Thrown when an uploaded file type is not allowed. */
export class UnsupportedFileTypeError extends Error {
    constructor(mimeType) {
        super(`File type "${mimeType}" is not supported`);
        this.name = 'UnsupportedFileTypeError';
    }
}
/** Thrown when a media record cannot be found. */
export class MediaNotFoundError extends Error {
    constructor(id) {
        super(`Media "${id}" not found`);
        this.name = 'MediaNotFoundError';
    }
}
//# sourceMappingURL=types.js.map