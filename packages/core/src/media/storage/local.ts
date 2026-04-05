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

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import type { StorageProvider, UploadOptions, UploadResult } from '../types.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// LocalStorageProvider
// ---------------------------------------------------------------------------

/**
 * Storage provider that persists files to the local filesystem.
 * Implements the Volqan StorageProvider interface.
 */
export class LocalStorageProvider implements StorageProvider {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(options: LocalStorageOptions) {
    this.uploadDir = path.resolve(options.uploadDir);
    this.baseUrl = options.baseUrl.replace(/\/$/, ''); // strip trailing slash
  }

  // -------------------------------------------------------------------------
  // Upload
  // -------------------------------------------------------------------------

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
  async upload(
    file: Buffer | Blob,
    originalName: string,
    _mimeType: string,
    options?: UploadOptions,
  ): Promise<UploadResult> {
    const ext = path.extname(originalName).toLowerCase();
    const baseName = options?.filename
      ? slugify(options.filename)
      : slugify(path.basename(originalName, ext));
    const uid = crypto.randomBytes(4).toString('hex');
    const filename = `${baseName}-${uid}${ext}`;

    const folder = options?.folder ? sanitizeFolderPath(options.folder) : '';
    const targetDir = folder ? path.join(this.uploadDir, folder) : this.uploadDir;
    const filePath = path.join(targetDir, filename);
    const key = folder ? `${folder}/${filename}` : filename;

    // Ensure directory exists
    await fs.mkdir(targetDir, { recursive: true });

    // Write file
    const buffer = file instanceof Blob ? Buffer.from(await file.arrayBuffer()) : file;
    await fs.writeFile(filePath, buffer);

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
   * Removes a file from the local filesystem.
   * Silently succeeds if the file does not exist (idempotent).
   *
   * @param key The storage key returned by `upload`.
   */
  async delete(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code !== 'ENOENT') throw err;
      // File doesn't exist — treat as success
    }
  }

  // -------------------------------------------------------------------------
  // URL
  // -------------------------------------------------------------------------

  /**
   * Constructs the public URL for a stored file.
   *
   * @param filename The stored filename.
   * @param folder Optional folder prefix.
   */
  getUrl(filename: string, folder?: string): string {
    if (folder) {
      return `${this.baseUrl}/${sanitizeFolderPath(folder)}/${filename}`;
    }
    return `${this.baseUrl}/${filename}`;
  }

  // -------------------------------------------------------------------------
  // List
  // -------------------------------------------------------------------------

  /**
   * Lists all files in the upload directory (or a subfolder).
   *
   * @param folder Optional folder path to list (relative to uploadDir).
   * @returns Array of file metadata objects.
   */
  async listFiles(folder?: string): Promise<Array<{ filename: string; key: string; size: number }>> {
    const targetDir = folder
      ? path.join(this.uploadDir, sanitizeFolderPath(folder))
      : this.uploadDir;

    let entries: any[];
    try {
      entries = await fs.readdir(targetDir, { withFileTypes: true });
    } catch (err) {
      const nodeErr = err as NodeJS.ErrnoException;
      if (nodeErr.code === 'ENOENT') return [];
      throw err;
    }

    const results: Array<{ filename: string; key: string; size: number }> = [];

    for (const entry of entries) {
      if (!entry.isFile()) continue;

      const filePath = path.join(targetDir, entry.name);
      const stat = await fs.stat(filePath);
      const key = folder ? `${sanitizeFolderPath(folder)}/${entry.name}` : entry.name;

      results.push({
        filename: entry.name,
        key,
        size: stat.size,
      });
    }

    return results;
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  /**
   * Returns the absolute filesystem path for a stored file key.
   * Useful for reading the file for image processing.
   */
  getFilePath(key: string): string {
    return path.join(this.uploadDir, key);
  }
}

// ---------------------------------------------------------------------------
// Private utilities
// ---------------------------------------------------------------------------

/**
 * Converts a string to a URL-safe slug.
 * e.g. "My Photo (2024).jpg" → "my-photo-2024"
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60); // cap length
}

/**
 * Sanitizes a folder path to prevent directory traversal.
 * Removes leading slashes, dots, and path traversal sequences.
 */
function sanitizeFolderPath(folder: string): string {
  return folder
    .replace(/\.\./g, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .replace(/[^a-zA-Z0-9/_-]/g, '');
}
