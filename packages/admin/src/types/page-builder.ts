/**
 * @file types/page-builder.ts
 * @description Page builder type definitions for the admin package.
 * These mirror the core page types but avoid deep import paths.
 */

export type BlockCategory =
  | 'layout'
  | 'content'
  | 'data'
  | 'forms'
  | 'navigation'
  | 'media'
  | 'advanced';

export type BlockType =
  | 'section'
  | 'container'
  | 'grid-2col'
  | 'grid-3col'
  | 'grid-4col'
  | 'spacer'
  | 'divider'
  | 'heading'
  | 'paragraph'
  | 'rich-text'
  | 'image'
  | 'video'
  | 'button'
  | 'link'
  | 'content-list'
  | 'content-grid'
  | 'content-detail'
  | 'contact-form'
  | 'newsletter'
  | 'custom-form'
  | 'navbar'
  | 'footer'
  | 'breadcrumb'
  | 'sidebar-nav'
  | 'gallery'
  | 'carousel'
  | 'hero'
  | 'banner'
  | 'html'
  | 'code'
  | 'embed'
  | 'map';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'number'
  | 'boolean'
  | 'select'
  | 'color'
  | 'image'
  | 'url'
  | 'code';

export interface FieldOption {
  label: string;
  value: string;
}

export interface BlockField {
  key: string;
  label: string;
  type: FieldType;
  defaultValue?: unknown;
  options?: FieldOption[];
  placeholder?: string;
  required?: boolean;
  group?: 'content' | 'style' | 'advanced';
  description?: string;
}

export interface BlockSchema {
  fields: BlockField[];
}

export interface BlockStyleProps {
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  marginTop?: string;
  marginBottom?: string;
  backgroundColor?: string;
  textColor?: string;
  backgroundImage?: string;
  borderRadius?: string;
  border?: string;
}

export interface BlockAdvancedProps {
  id?: string;
  className?: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
  customCss?: string;
}

export interface Block {
  id: string;
  type: BlockType;
  label?: string;
  props: Record<string, unknown>;
  style: BlockStyleProps;
  advanced: BlockAdvancedProps;
  children?: Block[];
}

export interface BlockDefinition {
  type: BlockType;
  label: string;
  category: BlockCategory;
  icon: string;
  description: string;
  schema: BlockSchema;
  defaultProps: Record<string, unknown>;
  defaultStyle?: BlockStyleProps;
  supportsChildren?: boolean;
}

export type PageStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export interface PageMeta {
  title?: string;
  description?: string;
  ogImage?: string;
  keywords?: string[];
  canonical?: string;
  noIndex?: boolean;
}

export interface PageSettings {
  template?: string;
  layout?: 'full' | 'content' | 'landing' | 'custom';
  hideNav?: boolean;
  hideFooter?: boolean;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  blocks: Block[];
  meta: PageMeta;
  settings: PageSettings;
  authorId?: string;
  publishedAt?: Date;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageVersion {
  id: string;
  pageId: string;
  version: number;
  blocks: Block[];
  meta: PageMeta;
  settings: PageSettings;
  createdAt: Date;
  label?: string;
}

export interface CreatePageInput {
  title: string;
  slug: string;
  status?: PageStatus;
  blocks?: Block[];
  meta?: PageMeta;
  settings?: PageSettings;
}

export interface UpdatePageInput {
  title?: string;
  slug?: string;
  status?: PageStatus;
  blocks?: Block[];
  meta?: PageMeta;
  settings?: PageSettings;
  publishedAt?: Date;
}
