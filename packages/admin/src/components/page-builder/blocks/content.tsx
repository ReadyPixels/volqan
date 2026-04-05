'use client';

/**
 * @file components/page-builder/blocks/content.tsx
 * @description Content block render components (Heading, Paragraph, RichText, Image, Video, Button, Link).
 */

import * as React from 'react';
import type { Block } from '@/types/page-builder';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Heading
// ---------------------------------------------------------------------------

export function HeadingBlock({ block }: { block: Block }) {
  const props = block.props as Record<string, string>;
  const level = (props.level ?? 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const text = props.text ?? 'Heading Text';
  const align = props.align ?? 'left';

  const sizeMap: Record<string, string> = {
    h1: 'text-4xl md:text-5xl font-bold',
    h2: 'text-3xl md:text-4xl font-bold',
    h3: 'text-2xl md:text-3xl font-semibold',
    h4: 'text-xl md:text-2xl font-semibold',
    h5: 'text-lg md:text-xl font-medium',
    h6: 'text-base md:text-lg font-medium',
  };

  const Tag = level;
  return (
    <Tag
      id={block.advanced?.id}
      className={cn(sizeMap[level] ?? sizeMap.h2, 'leading-tight', block.advanced?.className)}
      style={{
        color: block.style?.textColor || undefined,
        textAlign: align as React.CSSProperties['textAlign'],
        marginTop: block.style?.marginTop,
        marginBottom: block.style?.marginBottom || '0.5rem',
      }}
    >
      {text}
    </Tag>
  );
}

// ---------------------------------------------------------------------------
// Paragraph
// ---------------------------------------------------------------------------

export function ParagraphBlock({ block }: { block: Block }) {
  const props = block.props as Record<string, string>;
  const text = props.text ?? 'Paragraph text goes here. Click to edit.';
  const align = props.align ?? 'left';
  const fontSize = props.fontSize ?? '1rem';

  return (
    <p
      id={block.advanced?.id}
      className={cn('leading-relaxed', block.advanced?.className)}
      style={{
        color: block.style?.textColor || undefined,
        textAlign: align as React.CSSProperties['textAlign'],
        fontSize: fontSize,
        marginTop: block.style?.marginTop,
        marginBottom: block.style?.marginBottom || '1rem',
      }}
    >
      {text}
    </p>
  );
}

// ---------------------------------------------------------------------------
// RichText
// ---------------------------------------------------------------------------

export function RichTextBlock({ block }: { block: Block }) {
  const props = block.props as Record<string, string>;
  const html = props.html ?? '<p>Rich text content goes here.</p>';

  return (
    <div
      id={block.advanced?.id}
      className={cn('prose prose-sm max-w-none', block.advanced?.className)}
      style={{
        color: block.style?.textColor || undefined,
        marginTop: block.style?.marginTop,
        marginBottom: block.style?.marginBottom,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ---------------------------------------------------------------------------
// Image
// ---------------------------------------------------------------------------

export function ImageBlock({ block }: { block: Block }) {
  const props = block.props as Record<string, string>;
  const src = props.src ?? '';
  const alt = props.alt ?? '';
  const align = props.align ?? 'center';
  const width = props.width ?? '100%';
  const borderRadius = block.style?.borderRadius ?? '0';

  const alignClass: Record<string, string> = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto',
  };

  return (
    <div className={cn('block', alignClass[align] ?? 'mx-auto')} style={{ width }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          id={block.advanced?.id}
          src={src}
          alt={alt}
          className={cn('block max-w-full', block.advanced?.className)}
          style={{ borderRadius, width: '100%' }}
        />
      ) : (
        <div
          className="flex items-center justify-center bg-gray-100 text-gray-400 text-sm rounded-lg"
          style={{ height: '200px', borderRadius }}
        >
          No image selected
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Video
// ---------------------------------------------------------------------------

export function VideoBlock({ block }: { block: Block }) {
  const props = block.props as Record<string, string>;
  const src = props.src ?? '';
  const embedType = props.embedType ?? 'youtube'; // youtube | vimeo | direct

  function getEmbedUrl(url: string, type: string): string {
    if (type === 'youtube') {
      const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
      return m ? `https://www.youtube.com/embed/${m[1]}` : url;
    }
    if (type === 'vimeo') {
      const m = url.match(/vimeo\.com\/(\d+)/);
      return m ? `https://player.vimeo.com/video/${m[1]}` : url;
    }
    return url;
  }

  if (!src) {
    return (
      <div className="flex items-center justify-center bg-gray-100 text-gray-400 text-sm rounded-lg" style={{ height: '240px' }}>
        No video URL set
      </div>
    );
  }

  if (embedType === 'direct') {
    return (
      <video
        src={src}
        controls
        className={cn('w-full rounded-lg', block.advanced?.className)}
        style={{ borderRadius: block.style?.borderRadius }}
      />
    );
  }

  return (
    <div className={cn('relative w-full', block.advanced?.className)} style={{ paddingBottom: '56.25%' }}>
      <iframe
        src={getEmbedUrl(src, embedType)}
        className="absolute inset-0 w-full h-full rounded-lg"
        allowFullScreen
        title="Video"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------

export function ButtonBlock({ block }: { block: Block }) {
  const props = block.props as Record<string, string>;
  const text = props.text ?? 'Click Me';
  const href = props.href ?? '#';
  const variant = props.variant ?? 'primary';
  const size = props.size ?? 'md';
  const align = props.align ?? 'left';
  const openInNewTab = props.openInNewTab === 'true';

  const variantClass: Record<string, string> = {
    primary: 'bg-[hsl(var(--primary))] text-white hover:opacity-90',
    secondary: 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:opacity-90',
    outline: 'border-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.1)]',
    ghost: 'hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  };

  const sizeClass: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
  };

  const alignClass: Record<string, string> = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={cn('flex', alignClass[align] ?? 'justify-start')}>
      <a
        href={href}
        target={openInNewTab ? '_blank' : undefined}
        rel={openInNewTab ? 'noopener noreferrer' : undefined}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-all duration-150',
          variantClass[variant] ?? variantClass.primary,
          sizeClass[size] ?? sizeClass.md,
          block.advanced?.className,
        )}
        style={{ backgroundColor: block.style?.backgroundColor || undefined }}
      >
        {text}
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Link
// ---------------------------------------------------------------------------

export function LinkBlock({ block }: { block: Block }) {
  const props = block.props as Record<string, string>;
  const text = props.text ?? 'Link text';
  const href = props.href ?? '#';
  const openInNewTab = props.openInNewTab === 'true';

  return (
    <a
      href={href}
      target={openInNewTab ? '_blank' : undefined}
      rel={openInNewTab ? 'noopener noreferrer' : undefined}
      className={cn('text-[hsl(var(--primary))] hover:underline', block.advanced?.className)}
      style={{ color: block.style?.textColor || undefined }}
    >
      {text}
    </a>
  );
}
