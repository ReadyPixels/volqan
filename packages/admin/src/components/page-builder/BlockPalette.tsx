'use client';

/**
 * @file components/page-builder/BlockPalette.tsx
 * @description Left panel block palette organized by category.
 * Supports drag-to-canvas interactions.
 */

import * as React from 'react';
import { BLOCK_REGISTRY, BLOCK_CATEGORIES, getBlocksByCategory } from './blocks/index';
import type { BlockDefinition, BlockType } from '@/types/page-builder';
import { cn } from '@/lib/utils';
import {
  LayoutTemplate, Type, Database, FormInput, Navigation, Image, Code2,
  Square, Box, Columns2, MoveVertical, Minus, Heading, AlignLeft, FileText,
  Video, MousePointer, Link, List, LayoutGrid, Mail, Send, Navigation2,
  PanelBottom, ChevronRight, PanelLeft, Images, MonitorPlay, Flag, Sparkles,
  Terminal, ExternalLink, MapPin, Search, Columns3, Grid,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Icon resolver
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutTemplate,
  Type,
  Database,
  FormInput,
  Navigation,
  Image,
  Code2,
  Square,
  Box,
  Columns2,
  Columns3,
  Grid,
  MoveVertical,
  Minus,
  Heading,
  AlignLeft,
  FileText,
  Video,
  MousePointer,
  Link,
  List,
  LayoutGrid,
  Mail,
  Send,
  Navigation2,
  PanelBottom,
  ChevronRight,
  PanelLeft,
  Images,
  MonitorPlay,
  Flag,
  Sparkles,
  Terminal,
  ExternalLink,
  MapPin,
};

function BlockIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? Square;
  return <Icon className={className} />;
}

// ---------------------------------------------------------------------------
// Draggable block item
// ---------------------------------------------------------------------------

interface BlockItemProps {
  definition: BlockDefinition;
  onAdd: (type: BlockType) => void;
}

function BlockItem({ definition, onAdd }: BlockItemProps) {
  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('application/x-block-type', definition.type);
    e.dataTransfer.effectAllowed = 'copy';
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onAdd(definition.type)}
      title={definition.description}
      className={cn(
        'flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer select-none',
        'border border-transparent hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]',
        'transition-all duration-100 group',
      )}
    >
      <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-md bg-[hsl(var(--muted))] group-hover:bg-[hsl(var(--primary)/0.1)]">
        <BlockIcon name={definition.icon} className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))]" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[hsl(var(--foreground))] leading-tight">{definition.label}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Category icon resolver
// ---------------------------------------------------------------------------

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  layout: LayoutTemplate,
  content: Type,
  data: Database,
  forms: FormInput,
  navigation: Navigation2,
  media: Image,
  advanced: Code2,
};

// ---------------------------------------------------------------------------
// BlockPalette
// ---------------------------------------------------------------------------

interface BlockPaletteProps {
  onAddBlock: (type: BlockType) => void;
}

export function BlockPalette({ onAddBlock }: BlockPaletteProps) {
  const [activeCategory, setActiveCategory] = React.useState<string>('content');
  const [search, setSearch] = React.useState('');

  const filteredBlocks = React.useMemo(() => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return BLOCK_REGISTRY.filter(
        (b) =>
          b.label.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.type.toLowerCase().includes(q),
      );
    }
    return getBlocksByCategory(activeCategory);
  }, [activeCategory, search]);

  return (
    <aside className="flex flex-col h-full bg-[hsl(var(--card))] border-r border-[hsl(var(--border))] w-64 flex-shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[hsl(var(--border))]">
        <p className="text-xs font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider mb-2">
          Blocks
        </p>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Search blocks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]"
          />
        </div>
      </div>

      {/* Category tabs (hidden when searching) */}
      {!search.trim() && (
        <div className="border-b border-[hsl(var(--border))]">
          <div className="flex flex-wrap gap-1 p-2">
            {BLOCK_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICON_MAP[cat.id] ?? Square;
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors',
                    active
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                      : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]',
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Block list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {filteredBlocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">No blocks found</p>
          </div>
        ) : (
          filteredBlocks.map((def) => (
            <BlockItem key={def.type} definition={def} onAdd={onAddBlock} />
          ))
        )}
      </div>

      {/* Drag tip */}
      <div className="px-3 py-2 border-t border-[hsl(var(--border))] text-center">
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Click or drag to add
        </p>
      </div>
    </aside>
  );
}
