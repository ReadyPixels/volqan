/**
 * @file media/index.ts
 * @description Barrel export for the Volqan Media Manager.
 *
 * @example
 * ```ts
 * import {
 *   MediaManager,
 *   LocalStorageProvider,
 *   S3StorageProvider,
 *   ImageProcessor,
 *   isProcessableImage,
 *   MediaNotFoundError,
 *   FileTooLargeError,
 *   UnsupportedFileTypeError,
 * } from '@volqan/core/media';
 * ```
 */
export { SUPPORTED_IMAGE_TYPES, SUPPORTED_DOCUMENT_TYPES, SUPPORTED_VIDEO_TYPES, SUPPORTED_AUDIO_TYPES, ALL_SUPPORTED_TYPES, DEFAULT_MAX_FILE_SIZE, FileTooLargeError, UnsupportedFileTypeError, MediaNotFoundError, } from './types.js';
export type { MediaFile, UploadOptions, StorageProvider, UploadResult, MediaQueryOptions, SupportedMimeType, } from './types.js';
export { LocalStorageProvider } from './storage/local.js';
export type { LocalStorageOptions } from './storage/local.js';
export { S3StorageProvider } from './storage/s3.js';
export type { S3StorageOptions, S3Credentials } from './storage/s3.js';
export { ImageProcessor, isProcessableImage } from './image-processor.js';
export type { ImageDimensions, ThumbnailOptions, ResizeOptions } from './image-processor.js';
export { MediaManager } from './manager.js';
export type { MediaManagerOptions } from './manager.js';
//# sourceMappingURL=index.d.ts.map