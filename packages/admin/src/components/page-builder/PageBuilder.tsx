'use client';

/**
 * @file components/page-builder/PageBuilder.tsx
 * @description Main page builder component.
 * Left: block palette | Center: canvas | Right: block settings
 */

import * as React from 'react';
import type { Block, BlockType, Page } from '@/types/page-builder';
import { getBlockDefinition } from './blocks/index';
import { BlockPalette } from './BlockPalette';
import { BuilderCanvas, type DeviceMode } from './BuilderCanvas';
import { BlockSettings } from './BlockSettings';
import { cn } from '@/lib/utils';
import {
  Save,
  Eye,
  Globe,
  Undo2,
  Redo2,
  Settings2,
  Loader2,
  CheckCircle,
  X,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomUUID(): string {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// Undo/redo stack
// ---------------------------------------------------------------------------

function useHistory<T>(initial: T) {
  const [past, setPast] = React.useState<T[]>([]);
  const [present, setPresent] = React.useState<T>(initial);
  const [future, setFuture] = React.useState<T[]>([]);

  function set(next: T) {
    setPast((p) => [...p, present]);
    setPresent(next);
    setFuture([]);
  }

  function undo() {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [present, ...f]);
    setPresent(previous);
  }

  function redo() {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, present]);
    setPresent(next);
  }

  return { blocks: present, setBlocks: set, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0 };
}

// ---------------------------------------------------------------------------
// Save status
// ---------------------------------------------------------------------------

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ---------------------------------------------------------------------------
// PageBuilder
// ---------------------------------------------------------------------------

export interface PageBuilderProps {
  page: Page;
  onSave: (blocks: Block[], meta: Page['meta']) => Promise<void>;
  onPublish?: () => Promise<void>;
  onPreview?: () => void;
}

export function PageBuilder({ page, onSave, onPublish, onPreview }: PageBuilderProps) {
  const { blocks, setBlocks, undo, redo, canUndo, canRedo } = useHistory<Block[]>(page.blocks);
  const [selectedBlockId, setSelectedBlockId] = React.useState<string | null>(null);
  const [deviceMode, setDeviceMode] = React.useState<DeviceMode>('desktop');
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>('idle');
  const [showMetaPanel, setShowMetaPanel] = React.useState(false);
  const [meta, setMeta] = React.useState<Page['meta']>(page.meta);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) ?? null;

  // Keyboard shortcuts
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') {
        setSelectedBlockId(null);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, meta]);

  // ---------------------------------------------------------------------------
  // Block operations
  // ---------------------------------------------------------------------------

  function addBlock(type: BlockType, atIndex?: number) {
    const definition = getBlockDefinition(type);
    if (!definition) return;

    const newBlock: Block = {
      id: randomUUID(),
      type,
      label: definition.label,
      props: { ...definition.defaultProps },
      style: { ...definition.defaultStyle },
      advanced: {},
    };

    const next = [...blocks];
    const insertAt = atIndex !== undefined ? atIndex : next.length;
    next.splice(insertAt, 0, newBlock);
    setBlocks(next);
    setSelectedBlockId(newBlock.id);
  }

  function updateBlock(updated: Block) {
    setBlocks(blocks.map((b) => (b.id === updated.id ? updated : b)));
  }

  function deleteBlock(id: string) {
    setBlocks(blocks.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  }

  function duplicateBlock(id: string) {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx === -1) return;
    const original = blocks[idx];
    const duplicate: Block = { ...original, id: randomUUID() };
    const next = [...blocks];
    next.splice(idx + 1, 0, duplicate);
    setBlocks(next);
    setSelectedBlockId(duplicate.id);
  }

  function moveBlock(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    const next = [...blocks];
    const [moved] = next.splice(fromIndex, 1);
    const adjustedTo = fromIndex < toIndex ? toIndex - 1 : toIndex;
    next.splice(adjustedTo, 0, moved);
    setBlocks(next);
  }

  // ---------------------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------------------

  async function handleSave() {
    setSaveStatus('saving');
    try {
      await onSave(blocks, meta);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }

  async function handlePublish() {
    if (!onPublish) return;
    setSaveStatus('saving');
    try {
      await onSave(blocks, meta);
      await onPublish();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
    }
  }

  // ---------------------------------------------------------------------------
  // Save button
  // ---------------------------------------------------------------------------

  function SaveButton() {
    return (
      <button
        onClick={handleSave}
        disabled={saveStatus === 'saving'}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
          saveStatus === 'saved'
            ? 'bg-emerald-600 text-white'
            : saveStatus === 'error'
            ? 'bg-red-600 text-white'
            : 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90',
        )}
      >
        {saveStatus === 'saving' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {saveStatus === 'saved' && <CheckCircle className="w-3.5 h-3.5" />}
        {saveStatus === 'error' && <X className="w-3.5 h-3.5" />}
        {saveStatus === 'idle' && <Save className="w-3.5 h-3.5" />}
        {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : saveStatus === 'error' ? 'Error' : 'Save'}
      </button>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col h-full">
      {/* Top toolbar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] flex-shrink-0 z-10">
        {/* Left: page info + undo/redo */}
        <div className="flex items-center gap-2">
          <div className="mr-2">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] leading-tight">{page.title}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">/{page.slug}</p>
          </div>
          <div className="flex items-center gap-1 border-l border-[hsl(var(--border))] pl-2">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-1.5 rounded-md hover:bg-[hsl(var(--accent))] disabled:opacity-30 transition-colors"
              title="Undo (⌘Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-1.5 rounded-md hover:bg-[hsl(var(--accent))] disabled:opacity-30 transition-colors"
              title="Redo (⌘Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-[hsl(var(--muted-foreground))] ml-1">
            {blocks.length} block{blocks.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMetaPanel((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border',
              showMetaPanel
                ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--foreground))] hover:text-[hsl(var(--foreground))]',
            )}
          >
            <Settings2 className="w-3.5 h-3.5" />
            SEO
          </button>
          {onPreview && (
            <button
              onClick={onPreview}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
          )}
          <SaveButton />
          {onPublish && (
            <button
              onClick={handlePublish}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              Publish
            </button>
          )}
        </div>
      </header>

      {/* SEO/Meta panel */}
      {showMetaPanel && (
        <div className="bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] px-4 py-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--foreground))] mb-1">SEO Title</label>
              <input
                type="text"
                className="w-full border border-[hsl(var(--border))] rounded-md px-3 py-1.5 text-sm bg-[hsl(var(--background))]"
                value={meta.title ?? ''}
                onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))}
                placeholder="Page title for search engines"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--foreground))] mb-1">OG Image URL</label>
              <input
                type="text"
                className="w-full border border-[hsl(var(--border))] rounded-md px-3 py-1.5 text-sm bg-[hsl(var(--background))]"
                value={meta.ogImage ?? ''}
                onChange={(e) => setMeta((m) => ({ ...m, ogImage: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[hsl(var(--foreground))] mb-1">Meta Description</label>
              <textarea
                className="w-full border border-[hsl(var(--border))] rounded-md px-3 py-1.5 text-sm bg-[hsl(var(--background))] h-16 resize-none"
                value={meta.description ?? ''}
                onChange={(e) => setMeta((m) => ({ ...m, description: e.target.value }))}
                placeholder="Brief description for search engines (150–160 chars)"
              />
            </div>
          </div>
        </div>
      )}

      {/* Builder body: palette | canvas | settings */}
      <div className="flex flex-1 overflow-hidden">
        <BlockPalette onAddBlock={(type) => addBlock(type)} />

        <BuilderCanvas
          blocks={blocks}
          selectedBlockId={selectedBlockId}
          onSelectBlock={setSelectedBlockId}
          onAddBlock={addBlock}
          onDeleteBlock={deleteBlock}
          onDuplicateBlock={duplicateBlock}
          onMoveBlock={moveBlock}
          deviceMode={deviceMode}
          onDeviceModeChange={setDeviceMode}
        />

        {selectedBlock ? (
          <BlockSettings
            block={selectedBlock}
            onUpdate={updateBlock}
            onDelete={deleteBlock}
            onClose={() => setSelectedBlockId(null)}
          />
        ) : (
          <div className="w-72 flex-shrink-0 bg-[hsl(var(--card))] border-l border-[hsl(var(--border))] flex items-center justify-center text-center p-6">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center mx-auto mb-3">
                <Settings2 className="w-6 h-6 text-[hsl(var(--muted-foreground))]" />
              </div>
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">No block selected</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                Click a block in the canvas to edit its settings
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
