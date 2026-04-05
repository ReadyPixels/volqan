/**
 * @file media/image-processor.ts
 * @description Image processing utilities for the Volqan Media Manager.
 *
 * Provides thumbnail generation, resizing, and dimension extraction.
 * Uses `sharp` for high-performance image processing (lazy-loaded to keep
 * sharp as an optional peer dependency).
 *
 * @example
 * ```ts
 * const processor = new ImageProcessor();
 *
 * const dimensions = await processor.getImageDimensions(buffer);
 * const thumbnail = await processor.generateThumbnail(buffer, { width: 300, height: 300 });
 * const resized = await processor.resizeImage(buffer, { width: 1920 });
 * ```
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Width and height of an image in pixels. */
export interface ImageDimensions {
  width: number;
  height: number;
}

/** Options for thumbnail generation. */
export interface ThumbnailOptions {
  /** Target thumbnail width in pixels. Default: 300. */
  width?: number;
  /** Target thumbnail height in pixels. Default: 300. */
  height?: number;
  /**
   * Fit strategy passed to sharp.
   * - "cover": crop to fill the target dimensions (default)
   * - "contain": letterbox to fit within the target dimensions
   * - "fill": stretch to exactly fill the target dimensions
   * - "inside": resize to fit within the target dimensions, no crop
   * - "outside": resize to cover the target dimensions, no crop
   */
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  /** Output format. Default: "webp" (best compression/quality ratio). */
  format?: 'webp' | 'jpeg' | 'png';
  /** Output quality 1–100. Default: 80. */
  quality?: number;
}

/** Options for resizing an image. */
export interface ResizeOptions {
  /** Target width in pixels. If only width is supplied, height is computed to preserve aspect ratio. */
  width?: number;
  /** Target height in pixels. If only height is supplied, width is computed to preserve aspect ratio. */
  height?: number;
  /** Fit strategy. Default: "inside" (never upscale, preserve aspect ratio). */
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  /** Output format. Defaults to the input image format. */
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  /** Output quality 1–100. Default: 85. */
  quality?: number;
  /** When true, never upscale an image smaller than the target size. Default: true. */
  withoutEnlargement?: boolean;
}

// ---------------------------------------------------------------------------
// MIME types supported for processing
// ---------------------------------------------------------------------------

const PROCESSABLE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/tiff',
  'image/avif',
]);

/** Returns true if the MIME type can be processed by sharp. */
export function isProcessableImage(mimeType: string): boolean {
  return PROCESSABLE_MIME_TYPES.has(mimeType);
}

// ---------------------------------------------------------------------------
// ImageProcessor
// ---------------------------------------------------------------------------

/**
 * Handles image dimension extraction, thumbnail generation, and resizing.
 * All operations are non-destructive — the original buffer is never modified.
 */
export class ImageProcessor {

  // -------------------------------------------------------------------------
  // Dimensions
  // -------------------------------------------------------------------------

  /**
   * Extracts the pixel dimensions of an image.
   *
   * @param input Image data as a Buffer or file path string.
   * @returns Width and height in pixels.
   * @throws {Error} If the input is not a supported image format.
   */
  async getImageDimensions(input: Buffer | string): Promise<ImageDimensions> {
    const sharp = await this._loadSharp();
    const metadata = await sharp(input).metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error('Unable to determine image dimensions');
    }

    return {
      width: metadata.width,
      height: metadata.height,
    };
  }

  // -------------------------------------------------------------------------
  // Thumbnail
  // -------------------------------------------------------------------------

  /**
   * Generates a thumbnail of an image.
   *
   * The thumbnail is produced by:
   * 1. Resizing with the `cover` strategy (or the strategy specified in options)
   * 2. Encoding as WebP (or the format specified in options)
   *
   * @param input Image data as a Buffer or file path string.
   * @param options Thumbnail options.
   * @returns The thumbnail as a Buffer.
   */
  async generateThumbnail(
    input: Buffer | string,
    options: ThumbnailOptions = {},
  ): Promise<Buffer> {
    const sharp = await this._loadSharp();

    const {
      width = 300,
      height = 300,
      fit = 'cover',
      format = 'webp',
      quality = 80,
    } = options;

    const pipeline = sharp(input)
      .resize({ width, height, fit, withoutEnlargement: true });

    let outputBuffer: Buffer;

    switch (format) {
      case 'jpeg':
        outputBuffer = await pipeline.jpeg({ quality }).toBuffer();
        break;
      case 'png':
        outputBuffer = await pipeline.png({ quality }).toBuffer();
        break;
      case 'webp':
      default:
        outputBuffer = await pipeline.webp({ quality }).toBuffer();
        break;
    }

    return outputBuffer;
  }

  // -------------------------------------------------------------------------
  // Resize
  // -------------------------------------------------------------------------

  /**
   * Resizes an image to the specified dimensions while preserving aspect ratio.
   *
   * @param input Image data as a Buffer or file path string.
   * @param options Resize options. At least one of `width` or `height` must be provided.
   * @returns The resized image as a Buffer.
   */
  async resizeImage(input: Buffer | string, options: ResizeOptions): Promise<Buffer> {
    if (!options.width && !options.height) {
      throw new Error('At least one of width or height must be specified for resizeImage');
    }

    const sharp = await this._loadSharp();

    const {
      width,
      height,
      fit = 'inside',
      quality = 85,
      withoutEnlargement = true,
    } = options;

    const pipeline = sharp(input).resize({ width, height, fit, withoutEnlargement });

    if (!options.format) {
      // Preserve the original format
      return pipeline.toBuffer();
    }

    switch (options.format) {
      case 'jpeg':
        return pipeline.jpeg({ quality }).toBuffer();
      case 'png':
        return pipeline.png({ quality }).toBuffer();
      case 'avif':
        return pipeline.avif({ quality }).toBuffer();
      case 'webp':
      default:
        return pipeline.webp({ quality }).toBuffer();
    }
  }

  // -------------------------------------------------------------------------
  // Format conversion
  // -------------------------------------------------------------------------

  /**
   * Converts an image to a different format.
   *
   * @param input Image data as a Buffer or file path string.
   * @param format Target output format.
   * @param quality Encoding quality 1–100. Default: 85.
   * @returns The converted image as a Buffer.
   */
  async convertFormat(
    input: Buffer | string,
    format: 'webp' | 'jpeg' | 'png' | 'avif',
    quality = 85,
  ): Promise<Buffer> {
    const sharp = await this._loadSharp();
    const pipeline = sharp(input);

    switch (format) {
      case 'jpeg':
        return pipeline.jpeg({ quality }).toBuffer();
      case 'png':
        return pipeline.png({ quality }).toBuffer();
      case 'avif':
        return pipeline.avif({ quality }).toBuffer();
      case 'webp':
      default:
        return pipeline.webp({ quality }).toBuffer();
    }
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Dynamically imports `sharp` at runtime. This keeps sharp as an optional
   * peer dependency — projects that don't need image processing don't pay
   * the install cost.
   */
  private async _loadSharp(): Promise<any> {
    try {
      const sharpModule = await import('sharp') as any;
      return sharpModule.default ?? sharpModule;
    } catch {
      throw new Error(
        'ImageProcessor requires the "sharp" package to be installed. ' +
          'Run: pnpm add sharp',
      );
    }
  }
}
