/**
 * @file utils/files.ts
 * @description File copy and template rendering utilities for the CLI scaffolding tool.
 */

import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Absolute path to the templates directory. */
export const TEMPLATES_DIR = join(__dirname, '..', 'templates');

// ---------------------------------------------------------------------------
// Template rendering
// ---------------------------------------------------------------------------

export type TemplateVariables = Record<string, string | number | boolean>;

/**
 * Render a template string by replacing `{{VAR_NAME}}` placeholders.
 *
 * @param template - Template string with `{{VAR_NAME}}` placeholders.
 * @param vars - Map of variable names to values.
 * @returns The rendered string.
 */
export function renderTemplate(template: string, vars: TemplateVariables): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const val = vars[key];
    return val !== undefined ? String(val) : `{{${key}}}`;
  });
}

/**
 * Read a template file and render it with the given variables.
 *
 * @param templatePath - Absolute path to the template file.
 * @param vars - Template variables.
 * @returns Rendered file content.
 */
export async function renderTemplateFile(
  templatePath: string,
  vars: TemplateVariables,
): Promise<string> {
  const raw = await readFile(templatePath, 'utf-8');
  return renderTemplate(raw, vars);
}

// ---------------------------------------------------------------------------
// File writing
// ---------------------------------------------------------------------------

/**
 * Write content to a file, creating parent directories as needed.
 *
 * By default this overwrites whatever is already at `filePath`. Pass
 * `{ skipIfExists: true }` to leave an existing file untouched instead, useful when
 * scaffolding into a non-empty directory where files already there shouldn't be
 * clobbered without the caller asking for it explicitly.
 *
 * @param filePath - Absolute path to the output file.
 * @param content - Content to write.
 * @param opts - `skipIfExists` leaves an existing file alone instead of overwriting it.
 * @returns `true` if the file was written, `false` if it was skipped because it already
 *   existed and `skipIfExists` was set.
 */
export async function writeFileWithDirs(
  filePath: string,
  content: string,
  opts: { skipIfExists?: boolean } = {},
): Promise<boolean> {
  if (opts.skipIfExists && existsSync(filePath)) {
    return false;
  }
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, content, 'utf-8');
  return true;
}

/**
 * Copy a template file to the target path, rendering variables along the way.
 *
 * @param templateName - Filename in the templates directory (e.g. "package.json.template").
 * @param targetPath - Absolute output path.
 * @param vars - Template variables.
 * @param opts - `skipIfExists` leaves an existing file alone instead of overwriting it.
 * @returns `true` if the file was written, `false` if it was skipped.
 */
export async function copyTemplate(
  templateName: string,
  targetPath: string,
  vars: TemplateVariables,
  opts: { skipIfExists?: boolean } = {},
): Promise<boolean> {
  const templatePath = join(TEMPLATES_DIR, templateName);
  const content = await renderTemplateFile(templatePath, vars);
  return writeFileWithDirs(targetPath, content, opts);
}

/**
 * Check whether a directory is safe to scaffold into.
 * Returns true if it does not exist or is empty.
 */
export async function isEmptyOrAbsent(dirPath: string): Promise<boolean> {
  if (!existsSync(dirPath)) return true;
  const { readdir } = await import('node:fs/promises');
  const entries = await readdir(dirPath);
  return entries.length === 0;
}

/**
 * Generate a random hex string (used for JWT_SECRET generation).
 *
 * @param bytes - Number of random bytes (output is 2× the bytes in hex).
 */
export function randomHex(bytes = 32): string {
  const buf = Buffer.allocUnsafe(bytes);
  for (let i = 0; i < bytes; i++) {
    buf[i] = Math.floor(Math.random() * 256);
  }
  return buf.toString('hex');
}
