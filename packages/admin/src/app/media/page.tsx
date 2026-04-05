'use client';

/**
 * @file app/media/page.tsx
 * @description Media library with grid/list view, upload dropzone, and preview modal.
 */

import * as React from 'react';
import {
  Upload, Grid, List, Search, Folder, Image, File, Film,
  Trash2, Download, Copy, X, ChevronLeft, Plus,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

type MediaFileType = 'image' | 'video' | 'file';

interface MediaFile {
  id: string;
  name: string;
  type: MediaFileType;
  size: string;
  dimensions?: string;
  folder: string | null;
  url: string;
  createdAt: string;
}

const FOLDERS = ['Images', 'Documents', 'Videos', 'Products'];

const MEDIA_FILES: MediaFile[] = [
  { id: '1', name: 'hero-banner.jpg', type: 'image', size: '1.2 MB', dimensions: '1920×1080', folder: 'Images', url: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400', createdAt: '2d ago' },
  { id: '2', name: 'product-01.jpg', type: 'image', size: '845 KB', dimensions: '800×800', folder: 'Products', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', createdAt: '3d ago' },
  { id: '3', name: 'team-photo.jpg', type: 'image', size: '2.1 MB', dimensions: '2400×1600', folder: 'Images', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400', createdAt: '5d ago' },
  { id: '4', name: 'report-q4.pdf', type: 'file', size: '4.3 MB', folder: 'Documents', url: '#', createdAt: '1w ago' },
  { id: '5', name: 'demo-video.mp4', type: 'video', size: '24 MB', folder: 'Videos', url: '#', createdAt: '1w ago' },
  { id: '6', name: 'logo-dark.png', type: 'image', size: '45 KB', dimensions: '400×120', folder: 'Images', url: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400', createdAt: '2w ago' },
  { id: '7', name: 'product-02.jpg', type: 'image', size: '632 KB', dimensions: '800×800', folder: 'Products', url: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400', createdAt: '2w ago' },
  { id: '8', name: 'terms.pdf', type: 'file', size: '156 KB', folder: 'Documents', url: '#', createdAt: '3w ago' },
  { id: '9', name: 'product-03.jpg', type: 'image', size: '712 KB', dimensions: '800×800', folder: 'Products', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', createdAt: '3w ago' },
  { id: '10', name: 'cover-art.jpg', type: 'image', size: '1.8 MB', dimensions: '1200×630', folder: 'Images', url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400', createdAt: '1mo ago' },
  { id: '11', name: 'brand-guide.pdf', type: 'file', size: '8.2 MB', folder: 'Documents', url: '#', createdAt: '1mo ago' },
  { id: '12', name: 'promo-video.mp4', type: 'video', size: '56 MB', folder: 'Videos', url: '#', createdAt: '1mo ago' },
];

const FILE_ICON: Record<MediaFileType, React.ComponentType<{ className?: string }>> = {
  image: Image,
  video: Film,
  file: File,
};

// ---------------------------------------------------------------------------
// Dropzone
// ---------------------------------------------------------------------------

function UploadDropzone({ onDrop }: { onDrop: (files: FileList) => void }) {
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200',
        'cursor-pointer hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.03)]',
        dragging
          ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)]'
          : 'border-[hsl(var(--border))]',
      )}
      onDragEnter={() => setDragging(true)}
      onDragLeave={() => setDragging(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        onDrop(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <Upload className="w-8 h-8 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
      <p className="text-sm font-medium text-[hsl(var(--foreground))]">
        Drop files here, or click to browse
      </p>
      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
        JPG, PNG, GIF, MP4, PDF up to 100MB
      </p>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && onDrop(e.target.files)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preview modal
// ---------------------------------------------------------------------------

interface PreviewModalProps {
  file: MediaFile | null;
  onClose: () => void;
}

function PreviewModal({ file, onClose }: PreviewModalProps) {
  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-2xl w-full max-w-2xl animate-fade-in overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">{file.name}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[hsl(var(--accent))] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {file.type === 'image' ? (
          <div className="p-4 bg-[hsl(var(--muted)/0.3)] min-h-[300px] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={file.url} alt={file.name} className="max-h-96 max-w-full object-contain rounded" />
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center bg-[hsl(var(--muted)/0.3)]">
            {React.createElement(FILE_ICON[file.type], { className: 'w-16 h-16 text-[hsl(var(--muted-foreground))]' })}
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">{file.name}</p>
          </div>
        )}

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[hsl(var(--muted-foreground))]">Size</span>
              <p className="font-medium">{file.size}</p>
            </div>
            {file.dimensions && (
              <div>
                <span className="text-[hsl(var(--muted-foreground))]">Dimensions</span>
                <p className="font-medium">{file.dimensions}</p>
              </div>
            )}
            <div>
              <span className="text-[hsl(var(--muted-foreground))]">Folder</span>
              <p className="font-medium">{file.folder ?? 'Root'}</p>
            </div>
            <div>
              <span className="text-[hsl(var(--muted-foreground))]">Added</span>
              <p className="font-medium">{file.createdAt}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-[hsl(var(--border))]">
            <Button size="sm" variant="outline" className="gap-1">
              <Copy className="w-3.5 h-3.5" /> Copy URL
            </Button>
            <Button size="sm" variant="outline" className="gap-1">
              <Download className="w-3.5 h-3.5" /> Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function MediaPage() {
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [selectedFolder, setSelectedFolder] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [preview, setPreview] = React.useState<MediaFile | null>(null);
  const [files, setFiles] = React.useState(MEDIA_FILES);

  const filtered = files.filter((f) => {
    const matchFolder = selectedFolder === null || f.folder === selectedFolder;
    const matchSearch = !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFolder && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Media Library</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            {files.length} files · {(files.reduce((sum, f) => {
              const num = parseFloat(f.size);
              const unit = f.size.slice(-2);
              return sum + (unit === 'MB' ? num : unit === 'KB' ? num / 1024 : num);
            }, 0)).toFixed(1)} MB total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Upload zone */}
      <UploadDropzone onDrop={(fl) => console.log('Upload:', fl)} />

      <div className="flex gap-6">
        {/* Sidebar folders */}
        <div className="w-44 flex-shrink-0 space-y-1">
          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Folders</p>
          <button
            onClick={() => setSelectedFolder(null)}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
              selectedFolder === null
                ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]',
            )}
          >
            <Folder className="w-4 h-4" /> All Files
          </button>
          {FOLDERS.map((folder) => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder === selectedFolder ? null : folder)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                selectedFolder === folder
                  ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]',
              )}
            >
              <Folder className="w-4 h-4" /> {folder}
              <span className="ml-auto text-xs opacity-60">
                {files.filter((f) => f.folder === folder).length}
              </span>
            </button>
          ))}
        </div>

        {/* Main area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="w-full max-w-xs h-9 pl-9 pr-3 text-sm rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>

          {/* Files grid/list */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filtered.map((file) => {
                const Icon = FILE_ICON[file.type];
                return (
                  <div
                    key={file.id}
                    className="group relative rounded-lg border border-[hsl(var(--border))] overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200"
                    onClick={() => setPreview(file)}
                  >
                    <div className="aspect-square bg-[hsl(var(--muted)/0.3)] flex items-center justify-center overflow-hidden">
                      {file.type === 'image' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Icon className="w-10 h-10 text-[hsl(var(--muted-foreground))]" />
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium truncate">{file.name}</p>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{file.size}</p>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); setFiles((prev) => prev.filter((f) => f.id !== file.id)); }}
                        className="w-6 h-6 bg-black/60 rounded text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-[hsl(var(--border))] overflow-hidden">
              {filtered.map((file) => {
                const Icon = FILE_ICON[file.type];
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--accent))] cursor-pointer group"
                    onClick={() => setPreview(file)}
                  >
                    <div className="w-8 h-8 rounded bg-[hsl(var(--muted)/0.4)] flex items-center justify-center flex-shrink-0">
                      {file.type === 'image' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={file.url} alt="" className="w-full h-full object-cover rounded" />
                      ) : (
                        <Icon className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {file.folder} · {file.size}{file.dimensions ? ` · ${file.dimensions}` : ''}
                      </p>
                    </div>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{file.createdAt}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 opacity-0 group-hover:opacity-100 text-[hsl(var(--destructive))]"
                      onClick={(e: any) => { e.stopPropagation(); setFiles((prev) => prev.filter((f) => f.id !== file.id)); }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preview modal */}
      <PreviewModal file={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
