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
// Types
export { SUPPORTED_IMAGE_TYPES, SUPPORTED_DOCUMENT_TYPES, SUPPORTED_VIDEO_TYPES, SUPPORTED_AUDIO_TYPES, ALL_SUPPORTED_TYPES, DEFAULT_MAX_FILE_SIZE, FileTooLargeError, UnsupportedFileTypeError, MediaNotFoundError, } from './types.js';
// Storage providers
export { LocalStorageProvider } from './storage/local.js';
export { S3StorageProvider } from './storage/s3.js';
// Image processor
export { ImageProcessor, isProcessableImage } from './image-processor.js';
// Manager
export { MediaManager } from './manager.js';
//# sourceMappingURL=index.js.map