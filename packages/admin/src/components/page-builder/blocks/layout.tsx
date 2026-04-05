'use client';

/**
 * @file components/page-builder/blocks/layout.tsx
 * @description Layout block render components (Section, Container, Grid, Spacer, Divider).
 */

import * as React from 'react';
import type { Block } from '@/types/page-builder';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export function SectionBlock({ block }: { block: Block }) {
  const { backgroundColor, paddingTop, paddingBottom, backgroundImage } = block.style;
  return (
    <section
      id={block.advanced?.id}
      className={cn('w-full', block.advanced?.className)}
      style={{
        backgroundColor: backgroundColor || undefined,
        paddingTop: paddingTop || '3rem',
        paddingBottom: paddingBottom || '3rem',
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        {block.children?.map((child) => (
          <ChildBlockPlaceholder key={child.id} block={child} />
        ))}
        {(!block.children || block.children.length === 0) && (
          <div className="min-h-[80px] flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            Section — drop blocks here
          </div>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Container
// ---------------------------------------------------------------------------

export function ContainerBlock({ block }: { block: Block }) {
  const { maxWidth = '1200px' } = block.props as Record<string, string>;
  const { backgroundColor, paddingTop, paddingBottom, paddingLeft, paddingRight } = block.style;
  return (
    <div
      id={block.advanced?.id}
      className={cn('mx-auto w-full', block.advanced?.className)}
      style={{
        maxWidth: maxWidth as string,
        backgroundColor: backgroundColor || undefined,
        paddingTop: paddingTop || '1rem',
        paddingBottom: paddingBottom || '1rem',
        paddingLeft: paddingLeft || '1rem',
        paddingRight: paddingRight || '1rem',
      }}
    >
      {block.children?.map((child) => (
        <ChildBlockPlaceholder key={child.id} block={child} />
      ))}
      {(!block.children || block.children.length === 0) && (
        <div className="min-h-[60px] flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
          Container
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grid blocks
// ---------------------------------------------------------------------------

function GridBlock({ block, cols }: { block: Block; cols: number }) {
  const gridClass: Record<number, string> = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4',
  };
  const { gap = '1.5rem' } = block.props as Record<string, string>;
  return (
    <div
      id={block.advanced?.id}
      className={cn('grid w-full', gridClass[cols] ?? 'grid-cols-2', block.advanced?.className)}
      style={{ gap: gap as string }}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <div
          key={i}
          className="min-h-[60px] flex items-center justify-center text-gray-400 text-xs border-2 border-dashed border-gray-200 rounded-lg p-2"
        >
          Column {i + 1}
        </div>
      ))}
    </div>
  );
}

export function Grid2ColBlock({ block }: { block: Block }) {
  return <GridBlock block={block} cols={2} />;
}

export function Grid3ColBlock({ block }: { block: Block }) {
  return <GridBlock block={block} cols={3} />;
}

export function Grid4ColBlock({ block }: { block: Block }) {
  return <GridBlock block={block} cols={4} />;
}

// ---------------------------------------------------------------------------
// Spacer
// ---------------------------------------------------------------------------

export function SpacerBlock({ block }: { block: Block }) {
  const { height = '40px' } = block.props as Record<string, string>;
  return (
    <div
      id={block.advanced?.id}
      className={cn('w-full builder-spacer-indicator', block.advanced?.className)}
      style={{ height: height as string }}
    />
  );
}

// ---------------------------------------------------------------------------
// Divider
// ---------------------------------------------------------------------------

export function DividerBlock({ block }: { block: Block }) {
  const { style: lineStyle = 'solid', color, thickness = '1px' } = block.props as Record<string, string>;
  return (
    <hr
      id={block.advanced?.id}
      className={cn('w-full my-2', block.advanced?.className)}
      style={{
        borderStyle: lineStyle as string,
        borderColor: color || 'currentColor',
        borderTopWidth: thickness as string,
        opacity: 0.3,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Placeholder for nested children
// ---------------------------------------------------------------------------

function ChildBlockPlaceholder({ block }: { block: Block }) {
  return (
    <div className="p-2 border border-dashed border-gray-300 rounded text-xs text-gray-400">
      {block.type} block
    </div>
  );
}
