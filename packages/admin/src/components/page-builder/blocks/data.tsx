'use client';

/**
 * @file components/page-builder/blocks/data.tsx
 * @description Data block render components (ContentList, ContentGrid, ContentDetail).
 */

import * as React from 'react';
import type { Block } from '@/types/page-builder';
import { cn } from '@/lib/utils';
import { Database, List, LayoutGrid } from 'lucide-react';

// ---------------------------------------------------------------------------
// ContentList
// ---------------------------------------------------------------------------

export function ContentListBlock({ block }: { block: Block }) {
  const props = block.props as Record<string, string>;
  const contentType = props.contentType ?? '';
  const limit = parseInt(props.limit ?? '5', 10);
  const showDate = props.showDate !== 'false';
  const showAuthor = props.showAuthor !== 'false';

  return (
    <div
      id={block.advanced?.id}
      className={cn('w-full space-y-3', block.advanced?.className)}
    >
      {/* Builder preview: show skeleton items */}
      <div className="flex items-center gap-2 mb-3 text-xs text-[hsl(var(--muted-foreground))]">
        <List className="w-3.5 h-3.5" />
        <span>Content List {contentType ? `— ${contentType}` : '(no type selected)'}</span>
        <span className="ml-auto bg-[hsl(var(--accent))] px-1.5 py-0.5 rounded text-xs">
          {limit} items
        </span>
      </div>
      {Array.from({ length: Math.min(limit, 3) }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
        >
          <div className="w-10 h-10 rounded bg-[hsl(var(--muted))] flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="h-3 bg-[hsl(var(--muted))] rounded w-3/4 animate-pulse" />
            <div className="h-2.5 bg-[hsl(var(--muted))] rounded w-1/2 animate-pulse" />
            {(showDate || showAuthor) && (
              <div className="flex gap-2">
                {showDate && <div className="h-2 bg-[hsl(var(--muted))] rounded w-16" />}
                {showAuthor && <div className="h-2 bg-[hsl(var(--muted))] rounded w-20" />}
              </div>
            )}
          </div>
        </div>
      ))}
      {limit > 3 && (
        <p className="text-xs text-center text-[hsl(var(--muted-foreground))]">
          + {limit - 3} more items
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ContentGrid
// ---------------------------------------------------------------------------

export function ContentGridBlock({ block }: { block: Block }) {
  const props = block.props as Record<string, string>;
  const contentType = props.contentType ?? '';
  const cols = parseInt(props.cols ?? '3', 10);
  const limit = parseInt(props.limit ?? '6', 10);
  const showImage = props.showImage !== 'false';

  const gridClass: Record<number, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div
      id={block.advanced?.id}
      className={cn('w-full', block.advanced?.className)}
    >
      <div className="flex items-center gap-2 mb-3 text-xs text-[hsl(var(--muted-foreground))]">
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>Content Grid {contentType ? `— ${contentType}` : '(no type selected)'}</span>
        <span className="ml-auto bg-[hsl(var(--accent))] px-1.5 py-0.5 rounded text-xs">
          {cols} cols · {limit} items
        </span>
      </div>
      <div className={cn('grid gap-4', gridClass[cols] ?? gridClass[3])}>
        {Array.from({ length: Math.min(limit, 6) }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden"
          >
            {showImage && (
              <div className="aspect-video bg-[hsl(var(--muted))] animate-pulse" />
            )}
            <div className="p-3 space-y-1.5">
              <div className="h-3 bg-[hsl(var(--muted))] rounded w-3/4 animate-pulse" />
              <div className="h-2.5 bg-[hsl(var(--muted))] rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ContentDetail
// ---------------------------------------------------------------------------

export function ContentDetailBlock({ block }: { block: Block }) {
  const props = block.props as Record<string, string>;
  const contentType = props.contentType ?? '';
  const fields = (props.fields ?? 'title,body').split(',').map((f) => f.trim());

  return (
    <div
      id={block.advanced?.id}
      className={cn(
        'w-full p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]',
        block.advanced?.className,
      )}
    >
      <div className="flex items-center gap-2 mb-4 text-xs text-[hsl(var(--muted-foreground))]">
        <Database className="w-3.5 h-3.5" />
        <span>Content Detail {contentType ? `— ${contentType}` : '(no type selected)'}</span>
      </div>
      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field}>
            <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1">
              {field}
            </p>
            <div className="h-3 bg-[hsl(var(--muted))] rounded w-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
