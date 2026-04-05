/**
 * @file pages/index.ts
 * @description Barrel export for the page builder core module.
 */

export type {
  BlockCategory,
  BlockType,
  FieldType,
  FieldOption,
  BlockField,
  BlockSchema,
  BlockStyleProps,
  BlockAdvancedProps,
  Block,
  BlockDefinition,
  PageStatus,
  PageMeta,
  PageSettings,
  Page,
  PageVersion,
  CreatePageInput,
  UpdatePageInput,
  PageQueryOptions,
  PaginatedPages,
} from './types.js';

export { PageRepository, pageRepository } from './repository.js';
