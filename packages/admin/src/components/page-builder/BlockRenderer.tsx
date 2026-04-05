'use client';

/**
 * @file components/page-builder/BlockRenderer.tsx
 * @description Renders a single block based on its type.
 */

import * as React from 'react';
import type { Block } from '@/types/page-builder';
import {
  SectionBlock,
  ContainerBlock,
  Grid2ColBlock,
  Grid3ColBlock,
  Grid4ColBlock,
  SpacerBlock,
  DividerBlock,
} from './blocks/layout';
import {
  HeadingBlock,
  ParagraphBlock,
  RichTextBlock,
  ImageBlock,
  VideoBlock,
  ButtonBlock,
  LinkBlock,
} from './blocks/content';
import {
  ContentListBlock,
  ContentGridBlock,
  ContentDetailBlock,
} from './blocks/data';

// ---------------------------------------------------------------------------
// Form blocks (inline implementations)
// ---------------------------------------------------------------------------

function ContactFormBlock({ block }: { block: Block }) {
  const props = block.props as Record<string, string>;
  return (
    <div className="border border-[hsl(var(--border))] rounded-lg p-6 space-y-4 bg-[hsl(var(--card))]">
      {props.title && <h3 className="text-lg font-semibold">{props.title}</h3>}
      <div className="space-y-3">
        <input className="w-full border border-[hsl(var(--border))] rounded-md px-3 py-2 text-sm bg-[hsl(var(--background))]" placeholder="Your Name" readOnly />
        <input className="w-full border border-[hsl(var(--border))] rounded-md px-3 py-2 text-sm bg-[hsl(var(--background))]" placeholder="Email Address" readOnly />
        <textarea className="w-full border border-[hsl(var(--border))] rounded-md px-3 py-2 text-sm bg-[hsl(var(--background))] h-28 resize-none" placeholder="Your message..." readOnly />
        <button className="bg-[hsl(var(--primary))] text-white px-5 py-2 rounded-md text-sm font-medium" disabled>
          {props.submitLabel ?? 'Send Message'}
        </button>
      </div>
    </div>
  );
}

function NewsletterBlock({ block }: { block: Block }) {
  const props = block.props as Record<string, string>;
  return (
    <div className="border border-[hsl(var(--border))] rounded-lg p-6 bg-[hsl(var(--card))]">
      {props.title && <p className="text-sm font-medium mb-3">{props.title}</p>}
      <div className="flex gap-2">
        <input className="flex-1 border border-[hsl(var(--border))] rounded-md px-3 py-2 text-sm bg-[hsl(var(--background))]" placeholder={props.placeholder ?? 'Enter your email'} readOnly />
        <button className="bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-md text-sm font-medium" disabled>
          {props.submitLabel ?? 'Subscribe'}
        </button>
      </div>
    </div>
  );
}

function CustomFormBlock({ block }: { block: Block }) {
  const props = block.props as Record<string, string>;
  return (
    <div className="border border-[hsl(var(--border))] rounded-lg p-6 bg-[hsl(var(--card))]">
      {props.title && <h3 className="text-lg font-semibold mb-4">{props.title}</h3>}
      <div className="flex items-center justify-center h-24 text-[hsl(var(--muted-foreground))] text-sm border-2 border-dashed rounded-lg">
        Custom form fields here
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Navigation blocks (inline implementations)
// ---------------------------------------------------------------------------

function NavbarBlock({ block }: { block: Block }) {
  const props = block.props as Record<string, string>;
  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]"
      style={{ backgroundColor: block.style?.backgroundColor || undefined }}
    >
      <span className="font-bold text-base">{props.logo ?? 'Logo'}</span>
      <div className="flex items-center gap-6 text-sm text-[hsl(var(--muted-foreground))]">
        <span>Home</span>
        <span>About</span>
        <span>Contact</span>
      </div>
    </nav>
  );
}

function FooterBlock({ block }: { block: Block }) {
  const props = block.props as Record<string, string>;
  return (
    <footer className="px-6 py-6 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]"
      style={{ backgroundColor: block.style?.backgroundColor || undefined }}
    >
      <p className="text-sm text-[hsl(var(--muted-foreground))] text-center">
        {props.copyright ?? '© 2025 Your Company'}
      </p>
    </footer>
  );
}

function BreadcrumbBlock() {
  return (
    <nav className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
      <span>Home</span>
      <span>/</span>
      <span>Category</span>
      <span>/</span>
      <span className="text-[hsl(var(--foreground))]">Current Page</span>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Media blocks (inline implementations)
// ---------------------------------------------------------------------------

function HeroBlock({ block }: { block: Block }) {
  const props = block.props as Record<string, string>;
  return (
    <div
      className="relative flex flex-col items-center justify-center text-center py-24 px-6 overflow-hidden rounded-lg"
      style={{
        backgroundImage: props.backgroundImage ? `url(${props.backgroundImage})` : undefined,
        backgroundColor: block.style?.backgroundColor || 'hsl(var(--primary))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: block.style?.textColor || 'white',
        minHeight: '400px',
      }}
    >
      {props.backgroundImage && (
        <div className="absolute inset-0 bg-black/40 rounded-lg" />
      )}
      <div className="relative z-10 max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          {props.title ?? 'Hero Title'}
        </h1>
        {props.subtitle && (
          <p className="text-lg md:text-xl opacity-90 mb-8">{props.subtitle}</p>
        )}
        {props.ctaText && (
          <a href={props.ctaHref ?? '#'} className="inline-flex items-center px-8 py-3 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-colors">
            {props.ctaText}
          </a>
        )}
      </div>
    </div>
  );
}

function GalleryBlock({ block }: { block: Block }) {
  const props = block.props as Record<string, string>;
  const cols = parseInt(props.cols ?? '3', 10);
  return (
    <div className={`grid gap-3 ${cols === 2 ? 'grid-cols-2' : cols === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="aspect-square bg-[hsl(var(--muted))] rounded-lg flex items-center justify-center text-[hsl(var(--muted-foreground))] text-xs">
          Image {i + 1}
        </div>
      ))}
    </div>
  );
}

function CarouselBlock() {
  return (
    <div className="relative overflow-hidden rounded-lg bg-[hsl(var(--muted))]" style={{ minHeight: '300px' }}>
      <div className="flex items-center justify-center h-full min-h-[300px] text-[hsl(var(--muted-foreground))] text-sm">
        Carousel — slides will render here
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/50'}`} />
        ))}
      </div>
    </div>
  );
}

function BannerBlock({ block }: { block: Block }) {
  const props = block.props as Record<string, string>;
  return (
    <div
      className="flex items-center justify-between px-6 py-4 rounded-lg"
      style={{
        backgroundColor: block.style?.backgroundColor || 'hsl(var(--primary))',
        color: block.style?.textColor || 'white',
      }}
    >
      <p className="font-medium">{props.text ?? 'Banner text'}</p>
      {props.ctaText && (
        <a href={props.ctaHref ?? '#'} className="ml-4 px-4 py-1.5 bg-white text-gray-900 rounded-md text-sm font-medium whitespace-nowrap hover:bg-gray-100">
          {props.ctaText}
        </a>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Advanced blocks (inline implementations)
// ---------------------------------------------------------------------------

function HtmlBlock({ block }: { block: Block }) {
  const props = block.props as Record<string, string>;
  return (
    <div
      className="w-full"
      dangerouslySetInnerHTML={{ __html: props.html ?? '' }}
    />
  );
}

function CodeBlock({ block }: { block: Block }) {
  const props = block.props as Record<string, string>;
  return (
    <pre className="bg-gray-900 text-green-400 text-sm p-4 rounded-lg overflow-x-auto font-mono">
      <code>{props.code ?? ''}</code>
    </pre>
  );
}

function EmbedBlock({ block }: { block: Block }) {
  const props = block.props as Record<string, string>;
  const height = props.height ?? '400px';
  return (
    <iframe
      src={props.src}
      className="w-full rounded-lg border border-[hsl(var(--border))]"
      style={{ height }}
      title="Embedded content"
    />
  );
}

function MapBlock({ block }: { block: Block }) {
  const props = block.props as Record<string, string>;
  const height = props.height ?? '400px';
  const location = props.location ?? '';

  if (!location) {
    return (
      <div className="flex items-center justify-center bg-[hsl(var(--muted))] rounded-lg text-[hsl(var(--muted-foreground))] text-sm" style={{ height }}>
        Set a location or embed URL
      </div>
    );
  }

  return (
    <iframe
      src={location.startsWith('http') ? location : `https://maps.google.com/maps?q=${encodeURIComponent(location)}&output=embed`}
      className="w-full rounded-lg border border-[hsl(var(--border))]"
      style={{ height }}
      title="Map"
      allowFullScreen
    />
  );
}

// ---------------------------------------------------------------------------
// Main BlockRenderer
// ---------------------------------------------------------------------------

interface BlockRendererProps {
  block: Block;
}

export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    // Layout
    case 'section': return <SectionBlock block={block} />;
    case 'container': return <ContainerBlock block={block} />;
    case 'grid-2col': return <Grid2ColBlock block={block} />;
    case 'grid-3col': return <Grid3ColBlock block={block} />;
    case 'grid-4col': return <Grid4ColBlock block={block} />;
    case 'spacer': return <SpacerBlock block={block} />;
    case 'divider': return <DividerBlock block={block} />;

    // Content
    case 'heading': return <HeadingBlock block={block} />;
    case 'paragraph': return <ParagraphBlock block={block} />;
    case 'rich-text': return <RichTextBlock block={block} />;
    case 'image': return <ImageBlock block={block} />;
    case 'video': return <VideoBlock block={block} />;
    case 'button': return <ButtonBlock block={block} />;
    case 'link': return <LinkBlock block={block} />;

    // Data
    case 'content-list': return <ContentListBlock block={block} />;
    case 'content-grid': return <ContentGridBlock block={block} />;
    case 'content-detail': return <ContentDetailBlock block={block} />;

    // Forms
    case 'contact-form': return <ContactFormBlock block={block} />;
    case 'newsletter': return <NewsletterBlock block={block} />;
    case 'custom-form': return <CustomFormBlock block={block} />;

    // Navigation
    case 'navbar': return <NavbarBlock block={block} />;
    case 'footer': return <FooterBlock block={block} />;
    case 'breadcrumb': return <BreadcrumbBlock />;
    case 'sidebar-nav': return (
      <div className="flex flex-col gap-1 w-56 p-3 border border-[hsl(var(--border))] rounded-lg">
        {['Home', 'About', 'Services', 'Contact'].map((item) => (
          <div key={item} className="px-3 py-2 rounded-md hover:bg-[hsl(var(--accent))] text-sm cursor-pointer">
            {item}
          </div>
        ))}
      </div>
    );

    // Media
    case 'hero': return <HeroBlock block={block} />;
    case 'gallery': return <GalleryBlock block={block} />;
    case 'carousel': return <CarouselBlock />;
    case 'banner': return <BannerBlock block={block} />;

    // Advanced
    case 'html': return <HtmlBlock block={block} />;
    case 'code': return <CodeBlock block={block} />;
    case 'embed': return <EmbedBlock block={block} />;
    case 'map': return <MapBlock block={block} />;

    default:
      return (
        <div className="flex items-center justify-center h-16 border-2 border-dashed border-[hsl(var(--border))] rounded-lg text-[hsl(var(--muted-foreground))] text-sm">
          Unknown block: {block.type}
        </div>
      );
  }
}
