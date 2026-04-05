/**
 * @file components/page-builder/blocks/index.ts
 * @description Block registry: all block definitions for the page builder palette.
 */

import type { BlockDefinition } from '@/types/page-builder';

// ---------------------------------------------------------------------------
// Block registry
// ---------------------------------------------------------------------------

export const BLOCK_REGISTRY: BlockDefinition[] = [
  // -------------------------------------------------------------------------
  // Layout
  // -------------------------------------------------------------------------
  {
    type: 'section',
    label: 'Section',
    category: 'layout',
    icon: 'Square',
    description: 'Full-width section with background and padding',
    supportsChildren: true,
    defaultProps: {},
    defaultStyle: { paddingTop: '3rem', paddingBottom: '3rem' },
    schema: {
      fields: [
        { key: 'backgroundColor', label: 'Background Color', type: 'color', group: 'style' },
        { key: 'backgroundImage', label: 'Background Image URL', type: 'url', group: 'style' },
        { key: 'paddingTop', label: 'Padding Top', type: 'text', defaultValue: '3rem', group: 'style' },
        { key: 'paddingBottom', label: 'Padding Bottom', type: 'text', defaultValue: '3rem', group: 'style' },
      ],
    },
  },
  {
    type: 'container',
    label: 'Container',
    category: 'layout',
    icon: 'Box',
    description: 'Centered container with max-width',
    supportsChildren: true,
    defaultProps: { maxWidth: '1200px' },
    schema: {
      fields: [
        { key: 'maxWidth', label: 'Max Width', type: 'text', defaultValue: '1200px', group: 'content' },
        { key: 'paddingLeft', label: 'Padding Left', type: 'text', defaultValue: '1rem', group: 'style' },
        { key: 'paddingRight', label: 'Padding Right', type: 'text', defaultValue: '1rem', group: 'style' },
      ],
    },
  },
  {
    type: 'grid-2col',
    label: '2 Column Grid',
    category: 'layout',
    icon: 'Columns2',
    description: 'Responsive 2-column grid layout',
    supportsChildren: false,
    defaultProps: { gap: '1.5rem' },
    schema: {
      fields: [
        { key: 'gap', label: 'Gap', type: 'text', defaultValue: '1.5rem', group: 'style' },
      ],
    },
  },
  {
    type: 'grid-3col',
    label: '3 Column Grid',
    category: 'layout',
    icon: 'Columns3',
    description: 'Responsive 3-column grid layout',
    supportsChildren: false,
    defaultProps: { gap: '1.5rem' },
    schema: {
      fields: [
        { key: 'gap', label: 'Gap', type: 'text', defaultValue: '1.5rem', group: 'style' },
      ],
    },
  },
  {
    type: 'grid-4col',
    label: '4 Column Grid',
    category: 'layout',
    icon: 'Grid',
    description: 'Responsive 4-column grid layout',
    supportsChildren: false,
    defaultProps: { gap: '1.5rem' },
    schema: {
      fields: [
        { key: 'gap', label: 'Gap', type: 'text', defaultValue: '1.5rem', group: 'style' },
      ],
    },
  },
  {
    type: 'spacer',
    label: 'Spacer',
    category: 'layout',
    icon: 'MoveVertical',
    description: 'Vertical whitespace spacer',
    supportsChildren: false,
    defaultProps: { height: '40px' },
    schema: {
      fields: [
        { key: 'height', label: 'Height', type: 'text', defaultValue: '40px', group: 'content' },
      ],
    },
  },
  {
    type: 'divider',
    label: 'Divider',
    category: 'layout',
    icon: 'Minus',
    description: 'Horizontal divider line',
    supportsChildren: false,
    defaultProps: { style: 'solid', thickness: '1px' },
    schema: {
      fields: [
        {
          key: 'style',
          label: 'Line Style',
          type: 'select',
          defaultValue: 'solid',
          options: [
            { label: 'Solid', value: 'solid' },
            { label: 'Dashed', value: 'dashed' },
            { label: 'Dotted', value: 'dotted' },
          ],
          group: 'content',
        },
        { key: 'color', label: 'Color', type: 'color', group: 'style' },
        { key: 'thickness', label: 'Thickness', type: 'text', defaultValue: '1px', group: 'style' },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // Content
  // -------------------------------------------------------------------------
  {
    type: 'heading',
    label: 'Heading',
    category: 'content',
    icon: 'Heading',
    description: 'Section heading (H1–H6)',
    supportsChildren: false,
    defaultProps: { level: 'h2', text: 'Your Heading Here', align: 'left' },
    schema: {
      fields: [
        { key: 'text', label: 'Text', type: 'text', required: true, group: 'content' },
        {
          key: 'level',
          label: 'Level',
          type: 'select',
          defaultValue: 'h2',
          options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((h) => ({ label: h.toUpperCase(), value: h })),
          group: 'content',
        },
        {
          key: 'align',
          label: 'Alignment',
          type: 'select',
          defaultValue: 'left',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ],
          group: 'style',
        },
        { key: 'textColor', label: 'Color', type: 'color', group: 'style' },
      ],
    },
  },
  {
    type: 'paragraph',
    label: 'Paragraph',
    category: 'content',
    icon: 'AlignLeft',
    description: 'Text paragraph',
    supportsChildren: false,
    defaultProps: { text: 'Your paragraph text here.', align: 'left', fontSize: '1rem' },
    schema: {
      fields: [
        { key: 'text', label: 'Text', type: 'textarea', required: true, group: 'content' },
        {
          key: 'align',
          label: 'Alignment',
          type: 'select',
          defaultValue: 'left',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ],
          group: 'style',
        },
        { key: 'fontSize', label: 'Font Size', type: 'text', defaultValue: '1rem', group: 'style' },
        { key: 'textColor', label: 'Color', type: 'color', group: 'style' },
      ],
    },
  },
  {
    type: 'rich-text',
    label: 'Rich Text',
    category: 'content',
    icon: 'FileText',
    description: 'Rich text editor with full formatting',
    supportsChildren: false,
    defaultProps: { html: '<p>Rich text content</p>' },
    schema: {
      fields: [
        { key: 'html', label: 'Content (HTML)', type: 'richtext', group: 'content' },
      ],
    },
  },
  {
    type: 'image',
    label: 'Image',
    category: 'content',
    icon: 'Image',
    description: 'Image with optional caption',
    supportsChildren: false,
    defaultProps: { src: '', alt: '', align: 'center', width: '100%' },
    schema: {
      fields: [
        { key: 'src', label: 'Image URL', type: 'image', required: true, group: 'content' },
        { key: 'alt', label: 'Alt Text', type: 'text', group: 'content' },
        {
          key: 'align',
          label: 'Alignment',
          type: 'select',
          defaultValue: 'center',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ],
          group: 'style',
        },
        { key: 'width', label: 'Width', type: 'text', defaultValue: '100%', group: 'style' },
        { key: 'borderRadius', label: 'Border Radius', type: 'text', defaultValue: '0', group: 'style' },
      ],
    },
  },
  {
    type: 'video',
    label: 'Video',
    category: 'content',
    icon: 'Video',
    description: 'YouTube, Vimeo, or direct video',
    supportsChildren: false,
    defaultProps: { src: '', embedType: 'youtube' },
    schema: {
      fields: [
        { key: 'src', label: 'Video URL', type: 'url', required: true, group: 'content' },
        {
          key: 'embedType',
          label: 'Type',
          type: 'select',
          defaultValue: 'youtube',
          options: [
            { label: 'YouTube', value: 'youtube' },
            { label: 'Vimeo', value: 'vimeo' },
            { label: 'Direct', value: 'direct' },
          ],
          group: 'content',
        },
      ],
    },
  },
  {
    type: 'button',
    label: 'Button',
    category: 'content',
    icon: 'MousePointer',
    description: 'Call-to-action button',
    supportsChildren: false,
    defaultProps: { text: 'Click Me', href: '#', variant: 'primary', size: 'md', align: 'left' },
    schema: {
      fields: [
        { key: 'text', label: 'Button Text', type: 'text', required: true, group: 'content' },
        { key: 'href', label: 'Link URL', type: 'url', group: 'content' },
        {
          key: 'variant',
          label: 'Style',
          type: 'select',
          defaultValue: 'primary',
          options: [
            { label: 'Primary', value: 'primary' },
            { label: 'Secondary', value: 'secondary' },
            { label: 'Outline', value: 'outline' },
            { label: 'Ghost', value: 'ghost' },
          ],
          group: 'style',
        },
        {
          key: 'size',
          label: 'Size',
          type: 'select',
          defaultValue: 'md',
          options: [
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' },
          ],
          group: 'style',
        },
        {
          key: 'align',
          label: 'Alignment',
          type: 'select',
          defaultValue: 'left',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ],
          group: 'style',
        },
        { key: 'openInNewTab', label: 'Open in New Tab', type: 'boolean', group: 'advanced' },
      ],
    },
  },
  {
    type: 'link',
    label: 'Link',
    category: 'content',
    icon: 'Link',
    description: 'Inline hyperlink',
    supportsChildren: false,
    defaultProps: { text: 'Click here', href: '#' },
    schema: {
      fields: [
        { key: 'text', label: 'Link Text', type: 'text', required: true, group: 'content' },
        { key: 'href', label: 'URL', type: 'url', required: true, group: 'content' },
        { key: 'openInNewTab', label: 'Open in New Tab', type: 'boolean', group: 'advanced' },
        { key: 'textColor', label: 'Color', type: 'color', group: 'style' },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // Data
  // -------------------------------------------------------------------------
  {
    type: 'content-list',
    label: 'Content List',
    category: 'data',
    icon: 'List',
    description: 'Dynamic list from any content type',
    supportsChildren: false,
    defaultProps: { contentType: '', limit: '5', showDate: 'true', showAuthor: 'true' },
    schema: {
      fields: [
        { key: 'contentType', label: 'Content Type', type: 'text', required: true, group: 'content' },
        { key: 'limit', label: 'Max Items', type: 'number', defaultValue: '5', group: 'content' },
        { key: 'showDate', label: 'Show Date', type: 'boolean', group: 'content' },
        { key: 'showAuthor', label: 'Show Author', type: 'boolean', group: 'content' },
        { key: 'orderBy', label: 'Order By', type: 'text', defaultValue: 'createdAt', group: 'content' },
      ],
    },
  },
  {
    type: 'content-grid',
    label: 'Content Grid',
    category: 'data',
    icon: 'LayoutGrid',
    description: 'Dynamic grid from any content type',
    supportsChildren: false,
    defaultProps: { contentType: '', limit: '6', cols: '3', showImage: 'true' },
    schema: {
      fields: [
        { key: 'contentType', label: 'Content Type', type: 'text', required: true, group: 'content' },
        { key: 'limit', label: 'Max Items', type: 'number', defaultValue: '6', group: 'content' },
        {
          key: 'cols',
          label: 'Columns',
          type: 'select',
          defaultValue: '3',
          options: [
            { label: '2 Columns', value: '2' },
            { label: '3 Columns', value: '3' },
            { label: '4 Columns', value: '4' },
          ],
          group: 'style',
        },
        { key: 'showImage', label: 'Show Image', type: 'boolean', group: 'content' },
      ],
    },
  },
  {
    type: 'content-detail',
    label: 'Content Detail',
    category: 'data',
    icon: 'Database',
    description: 'Detailed view of a single content entry',
    supportsChildren: false,
    defaultProps: { contentType: '', fields: 'title,body' },
    schema: {
      fields: [
        { key: 'contentType', label: 'Content Type', type: 'text', required: true, group: 'content' },
        { key: 'fields', label: 'Fields to show (comma-separated)', type: 'text', group: 'content' },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // Forms
  // -------------------------------------------------------------------------
  {
    type: 'contact-form',
    label: 'Contact Form',
    category: 'forms',
    icon: 'Mail',
    description: 'Contact form with name, email, message',
    supportsChildren: false,
    defaultProps: { title: 'Contact Us', submitLabel: 'Send Message', recipientEmail: '' },
    schema: {
      fields: [
        { key: 'title', label: 'Form Title', type: 'text', group: 'content' },
        { key: 'submitLabel', label: 'Submit Button Text', type: 'text', group: 'content' },
        { key: 'recipientEmail', label: 'Recipient Email', type: 'text', group: 'content' },
      ],
    },
  },
  {
    type: 'newsletter',
    label: 'Newsletter',
    category: 'forms',
    icon: 'Send',
    description: 'Email newsletter signup form',
    supportsChildren: false,
    defaultProps: { title: 'Subscribe to our newsletter', placeholder: 'Enter your email', submitLabel: 'Subscribe' },
    schema: {
      fields: [
        { key: 'title', label: 'Title', type: 'text', group: 'content' },
        { key: 'placeholder', label: 'Input Placeholder', type: 'text', group: 'content' },
        { key: 'submitLabel', label: 'Button Text', type: 'text', group: 'content' },
      ],
    },
  },
  {
    type: 'custom-form',
    label: 'Custom Form',
    category: 'forms',
    icon: 'FormInput',
    description: 'Fully customizable form',
    supportsChildren: false,
    defaultProps: { title: 'Form', submitLabel: 'Submit' },
    schema: {
      fields: [
        { key: 'title', label: 'Form Title', type: 'text', group: 'content' },
        { key: 'submitLabel', label: 'Submit Button Text', type: 'text', group: 'content' },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------
  {
    type: 'navbar',
    label: 'Navbar',
    category: 'navigation',
    icon: 'Navigation',
    description: 'Site navigation bar',
    supportsChildren: false,
    defaultProps: { logo: 'Logo', sticky: 'false' },
    schema: {
      fields: [
        { key: 'logo', label: 'Logo Text', type: 'text', group: 'content' },
        { key: 'sticky', label: 'Sticky', type: 'boolean', group: 'style' },
        { key: 'backgroundColor', label: 'Background', type: 'color', group: 'style' },
      ],
    },
  },
  {
    type: 'footer',
    label: 'Footer',
    category: 'navigation',
    icon: 'PanelBottom',
    description: 'Site footer',
    supportsChildren: false,
    defaultProps: { copyright: '© 2025 Your Company. All rights reserved.' },
    schema: {
      fields: [
        { key: 'copyright', label: 'Copyright Text', type: 'text', group: 'content' },
        { key: 'backgroundColor', label: 'Background', type: 'color', group: 'style' },
      ],
    },
  },
  {
    type: 'breadcrumb',
    label: 'Breadcrumb',
    category: 'navigation',
    icon: 'ChevronRight',
    description: 'Breadcrumb navigation',
    supportsChildren: false,
    defaultProps: {},
    schema: { fields: [] },
  },
  {
    type: 'sidebar-nav',
    label: 'Sidebar Nav',
    category: 'navigation',
    icon: 'PanelLeft',
    description: 'Sidebar navigation menu',
    supportsChildren: false,
    defaultProps: {},
    schema: { fields: [] },
  },

  // -------------------------------------------------------------------------
  // Media
  // -------------------------------------------------------------------------
  {
    type: 'hero',
    label: 'Hero',
    category: 'media',
    icon: 'Sparkles',
    description: 'Full-width hero section with heading and CTA',
    supportsChildren: false,
    defaultProps: {
      title: 'Welcome to Our Site',
      subtitle: 'Build something amazing',
      ctaText: 'Get Started',
      ctaHref: '#',
      backgroundImage: '',
    },
    schema: {
      fields: [
        { key: 'title', label: 'Title', type: 'text', required: true, group: 'content' },
        { key: 'subtitle', label: 'Subtitle', type: 'textarea', group: 'content' },
        { key: 'ctaText', label: 'CTA Button Text', type: 'text', group: 'content' },
        { key: 'ctaHref', label: 'CTA Link', type: 'url', group: 'content' },
        { key: 'backgroundImage', label: 'Background Image', type: 'image', group: 'style' },
        { key: 'backgroundColor', label: 'Background Color', type: 'color', group: 'style' },
        { key: 'textColor', label: 'Text Color', type: 'color', group: 'style' },
      ],
    },
  },
  {
    type: 'gallery',
    label: 'Gallery',
    category: 'media',
    icon: 'Images',
    description: 'Masonry or grid image gallery',
    supportsChildren: false,
    defaultProps: { layout: 'grid', cols: '3' },
    schema: {
      fields: [
        {
          key: 'layout',
          label: 'Layout',
          type: 'select',
          defaultValue: 'grid',
          options: [
            { label: 'Grid', value: 'grid' },
            { label: 'Masonry', value: 'masonry' },
          ],
          group: 'style',
        },
        {
          key: 'cols',
          label: 'Columns',
          type: 'select',
          defaultValue: '3',
          options: ['2', '3', '4'].map((n) => ({ label: `${n} Columns`, value: n })),
          group: 'style',
        },
      ],
    },
  },
  {
    type: 'carousel',
    label: 'Carousel',
    category: 'media',
    icon: 'MonitorPlay',
    description: 'Auto-sliding image carousel',
    supportsChildren: false,
    defaultProps: { autoplay: 'true', interval: '4000' },
    schema: {
      fields: [
        { key: 'autoplay', label: 'Autoplay', type: 'boolean', group: 'content' },
        { key: 'interval', label: 'Interval (ms)', type: 'number', defaultValue: '4000', group: 'content' },
      ],
    },
  },
  {
    type: 'banner',
    label: 'Banner',
    category: 'media',
    icon: 'Flag',
    description: 'Promotional banner with text and CTA',
    supportsChildren: false,
    defaultProps: { text: 'Announcement or promotional banner text', ctaText: 'Learn More', ctaHref: '#' },
    schema: {
      fields: [
        { key: 'text', label: 'Banner Text', type: 'text', required: true, group: 'content' },
        { key: 'ctaText', label: 'CTA Text', type: 'text', group: 'content' },
        { key: 'ctaHref', label: 'CTA Link', type: 'url', group: 'content' },
        { key: 'backgroundColor', label: 'Background Color', type: 'color', group: 'style' },
        { key: 'textColor', label: 'Text Color', type: 'color', group: 'style' },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // Advanced
  // -------------------------------------------------------------------------
  {
    type: 'html',
    label: 'HTML',
    category: 'advanced',
    icon: 'Code2',
    description: 'Raw HTML block',
    supportsChildren: false,
    defaultProps: { html: '<div>Custom HTML</div>' },
    schema: {
      fields: [
        { key: 'html', label: 'HTML Code', type: 'code', group: 'content' },
      ],
    },
  },
  {
    type: 'code',
    label: 'Code Block',
    category: 'advanced',
    icon: 'Terminal',
    description: 'Syntax-highlighted code block',
    supportsChildren: false,
    defaultProps: { code: 'const hello = "world";', language: 'javascript' },
    schema: {
      fields: [
        { key: 'code', label: 'Code', type: 'code', group: 'content' },
        {
          key: 'language',
          label: 'Language',
          type: 'select',
          defaultValue: 'javascript',
          options: ['javascript', 'typescript', 'css', 'html', 'json', 'bash'].map((l) => ({ label: l, value: l })),
          group: 'content',
        },
      ],
    },
  },
  {
    type: 'embed',
    label: 'Embed',
    category: 'advanced',
    icon: 'ExternalLink',
    description: 'Embeddable iframe or widget',
    supportsChildren: false,
    defaultProps: { src: '', height: '400px' },
    schema: {
      fields: [
        { key: 'src', label: 'Embed URL', type: 'url', required: true, group: 'content' },
        { key: 'height', label: 'Height', type: 'text', defaultValue: '400px', group: 'style' },
      ],
    },
  },
  {
    type: 'map',
    label: 'Map',
    category: 'advanced',
    icon: 'MapPin',
    description: 'Embeddable map (Google Maps, OpenStreetMap)',
    supportsChildren: false,
    defaultProps: { location: '', height: '400px', zoom: '14' },
    schema: {
      fields: [
        { key: 'location', label: 'Location / Embed URL', type: 'text', required: true, group: 'content' },
        { key: 'height', label: 'Height', type: 'text', defaultValue: '400px', group: 'style' },
        { key: 'zoom', label: 'Zoom Level', type: 'number', defaultValue: '14', group: 'content' },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Registry helpers
// ---------------------------------------------------------------------------

export function getBlockDefinition(type: string): BlockDefinition | undefined {
  return BLOCK_REGISTRY.find((b) => b.type === type);
}

export function getBlocksByCategory(category: string): BlockDefinition[] {
  return BLOCK_REGISTRY.filter((b) => b.category === category);
}

export const BLOCK_CATEGORIES: Array<{ id: string; label: string; icon: string }> = [
  { id: 'layout', label: 'Layout', icon: 'LayoutTemplate' },
  { id: 'content', label: 'Content', icon: 'Type' },
  { id: 'data', label: 'Data', icon: 'Database' },
  { id: 'forms', label: 'Forms', icon: 'FormInput' },
  { id: 'navigation', label: 'Navigation', icon: 'Navigation' },
  { id: 'media', label: 'Media', icon: 'Image' },
  { id: 'advanced', label: 'Advanced', icon: 'Code2' },
];
