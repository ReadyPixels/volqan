'use client';

/**
 * @file components/page-builder/BuilderCanvas.tsx
 * @description Canvas area for the page builder.
 * Renders blocks in order, provides drop zones, selection, and reordering.
 */

import * as React from 'react';
import type { Block, BlockType } from '@/types/page-builder';
import { BlockRenderer } from './BlockRenderer';
import { cn } from '@/lib/utils';
import { GripVertical, Trash2, Copy, ArrowUp, ArrowDown, Monitor, Tablet, Smartphone } from 'lucide-react';

// ---------------------------------------------------------------------------
// Device preview widths
// ---------------------------------------------------------------------------

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

const DEVICE_WIDTHS: Record<DeviceMode, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

// ---------------------------------------------------------------------------
// Drop zone component
// ---------------------------------------------------------------------------

interface DropZoneProps {
  index: number;
  onDrop: (type: BlockType, index: number) => void;
  onDropReorder: (fromIndex: number, toIndex: number) => void;
}

function DropZone({ index, onDrop, onDropReorder }: DropZoneProps) {
  const [over, setOver] = React.useState(false);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setOver(true);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setOver(false);
    const blockType = e.dataTransfer.getData('application/x-block-type') as BlockType;
    const fromIndex = e.dataTransfer.getData('application/x-block-index');

    if (fromIndex !== '') {
      onDropReorder(parseInt(fromIndex, 10), index);
    } else if (blockType) {
      onDrop(blockType, index);
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={() => setOver(false)}
      onDrop={handleDrop}
      className={cn(
        'transition-all duration-150 mx-2 rounded-full',
        over
          ? 'h-1.5 bg-[hsl(var(--primary))] opacity-100 my-1'
          : 'h-0.5 bg-transparent opacity-0 hover:opacity-50 hover:bg-[hsl(var(--primary))/0.3]',
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// Block wrapper (selection, drag handle, controls)
// ---------------------------------------------------------------------------

interface BlockWrapperProps {
  block: Block;
  index: number;
  total: number;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function BlockWrapper({
  block,
  index,
  total,
  selected,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: BlockWrapperProps) {
  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('application/x-block-index', String(index));
    e.dataTransfer.effectAllowed = 'move';
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={cn(
        'relative group/block rounded-lg',
        selected
          ? 'ring-2 ring-[hsl(var(--primary))] ring-offset-1'
          : 'hover:ring-1 hover:ring-[hsl(var(--border))]',
      )}
    >
      {/* Drag handle */}
      <div className={cn(
        'absolute -left-8 top-1/2 -translate-y-1/2 cursor-grab opacity-0 transition-opacity',
        'group-hover/block:opacity-100',
        selected && 'opacity-100',
      )}>
        <GripVertical className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
      </div>

      {/* Block label */}
      {selected && (
        <div className="absolute -top-5 left-0 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xs px-2 py-0.5 rounded-t-md font-medium z-10">
          {block.label ?? block.type}
        </div>
      )}

      {/* Floating controls */}
      <div className={cn(
        'absolute top-2 right-2 flex items-center gap-1 z-20 opacity-0 transition-opacity',
        'group-hover/block:opacity-100',
        selected && 'opacity-100',
      )}>
        <button
          onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
          disabled={index === 0}
          className="p-1 rounded bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] disabled:opacity-30 shadow-sm"
          title="Move up"
        >
          <ArrowUp className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
          disabled={index === total - 1}
          className="p-1 rounded bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] disabled:opacity-30 shadow-sm"
          title="Move down"
        >
          <ArrowDown className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          className="p-1 rounded bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] shadow-sm"
          title="Duplicate"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:bg-red-50 hover:border-red-200 hover:text-red-600 shadow-sm"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Block content */}
      <div className="pointer-events-none">
        <BlockRenderer block={block} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BuilderCanvas
// ---------------------------------------------------------------------------

interface BuilderCanvasProps {
  blocks: Block[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onAddBlock: (type: BlockType, atIndex?: number) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onMoveBlock: (fromIndex: number, toIndex: number) => void;
  deviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
}

export function BuilderCanvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onAddBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveBlock,
  deviceMode,
  onDeviceModeChange,
}: BuilderCanvasProps) {
  function handleCanvasDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-[hsl(var(--muted)/0.3)]">
      {/* Device switcher */}
      <div className="flex items-center justify-center gap-2 py-2 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        {(
          [
            { mode: 'desktop' as const, Icon: Monitor, label: 'Desktop (1200px)' },
            { mode: 'tablet' as const, Icon: Tablet, label: 'Tablet (768px)' },
            { mode: 'mobile' as const, Icon: Smartphone, label: 'Mobile (375px)' },
          ] as const
        ).map(({ mode, Icon, label }) => (
          <button
            key={mode}
            onClick={() => onDeviceModeChange(mode)}
            title={label}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              deviceMode === mode
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]',
            )}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
        <span className="text-xs text-[hsl(var(--muted-foreground))] ml-2">
          {deviceMode === 'desktop' ? '1200px' : deviceMode === 'tablet' ? '768px' : '375px'}
        </span>
      </div>

      {/* Canvas scroll area */}
      <div
        className="flex-1 overflow-y-auto p-4 md:p-6"
        onClick={() => onSelectBlock(null)}
        onDragOver={handleCanvasDragOver}
      >
        {/* Page container */}
        <div
          className="mx-auto transition-all duration-300 bg-white dark:bg-[hsl(var(--background))] shadow-lg rounded-lg min-h-96 overflow-hidden"
          style={{ maxWidth: DEVICE_WIDTHS[deviceMode] }}
        >
          {blocks.length === 0 ? (
            <EmptyCanvas onDrop={(type) => onAddBlock(type, 0)} />
          ) : (
            <div className="p-2">
              <DropZone
                index={0}
                onDrop={(type, idx) => onAddBlock(type, idx)}
                onDropReorder={onMoveBlock}
              />
              {blocks.map((block, i) => (
                <React.Fragment key={block.id}>
                  <BlockWrapper
                    block={block}
                    index={i}
                    total={blocks.length}
                    selected={selectedBlockId === block.id}
                    onSelect={() => onSelectBlock(block.id)}
                    onDelete={() => onDeleteBlock(block.id)}
                    onDuplicate={() => onDuplicateBlock(block.id)}
                    onMoveUp={() => i > 0 && onMoveBlock(i, i - 1)}
                    onMoveDown={() => i < blocks.length - 1 && onMoveBlock(i, i + 1)}
                  />
                  <DropZone
                    index={i + 1}
                    onDrop={(type, idx) => onAddBlock(type, idx)}
                    onDropReorder={onMoveBlock}
                  />
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty canvas
// ---------------------------------------------------------------------------

function EmptyCanvas({ onDrop }: { onDrop: (type: BlockType) => void }) {
  const [over, setOver] = React.useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const type = e.dataTransfer.getData('application/x-block-type') as BlockType;
        if (type) onDrop(type);
      }}
      className={cn(
        'flex flex-col items-center justify-center py-24 px-8 text-center transition-all duration-150',
        over ? 'bg-[hsl(var(--primary)/0.05)]' : '',
      )}
    >
      <div className={cn(
        'w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-colors',
        over ? 'bg-[hsl(var(--primary)/0.2)]' : 'bg-[hsl(var(--muted))]',
      )}>
        <Monitor className={cn('w-8 h-8', over ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]')} />
      </div>
      <p className="text-base font-semibold text-[hsl(var(--foreground))] mb-1">
        {over ? 'Drop to add block' : 'Your page is empty'}
      </p>
      <p className="text-sm text-[hsl(var(--muted-foreground))]">
        Drag a block from the palette or click a block to add it
      </p>
    </div>
  );
}

export type { DeviceMode };
