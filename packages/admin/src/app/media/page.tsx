'use client';

/**
 * @file app/media/page.tsx
 * @description Media library with grid/list view, upload dropzone, and preview modal.
 * Data comes exclusively from /api/media — no mock fallbacks.
 */

import * as React from 'react';
import {
  Upload, Grid, List, Search, Folder, Image, File, Film,
  Trash2, Download, Copy, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingState, ErrorState, EmptyState, PermissionDeniedState } from '@/components/ui/async-states';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MediaFileType = 'image' | 'video' | 'file';

interface MediaFile {
  id: string;
  name: string;
  type: MediaFileType;
  sizeBytes: number;
  folder: string | null;
  url: string;
  createdAt: string;
}

interface ApiMediaRecord {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  folder: string | null;
  createdAt: string;
}

function toMediaFile(f: ApiMediaRecord): MediaFile {
  return {
    id: f.id,
    name: f.originalName,
    type: f.mimeType.startsWith('image/') ? 'image' : f.mimeType.startsWith('video/') ? 'video' : 'file',
    sizeBytes: f.size,
    folder: f.folder && f.folder !== '/' ? f.folder.replace(/^\//, '') : null,
    url: f.url,
    createdAt: new Date(f.createdAt).toLocaleDateString(),
  };
}

function formatSize(bytes: number): string {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

const FILE_ICON: Record<MediaFileType, React.ComponentType<{ className?: string }>> = {
  image: Image,
  video: Film,
  file: File,
};

// ---------------------------------------------------------------------------
// Dropzone
// ---------------------------------------------------------------------------

function UploadDropzone({ onDrop, uploading }: { onDrop: (files: FileList) => void; uploading: boolean }) {
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload files"
      aria-busy={uploading}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200',
        'cursor-pointer hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.03)]',
        uploading && 'opacity-60 pointer-events-none',
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
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
    >
      <Upload className="w-8 h-8 text-[hsl(var(--muted-foreground))] mx-auto mb-3" aria-hidden="true" />
      <p className="text-sm font-medium text-[hsl(var(--foreground))]">
        {uploading ? 'Uploading…' : 'Drop files here, or click to browse'}
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
  onCopied: () => void;
}

function PreviewModal({ file, onClose, onCopied }: PreviewModalProps) {
  if (!file) return null;

  const absoluteUrl = typeof window !== 'undefined' ? new URL(file.url, window.location.origin).href : file.url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Preview of ${file.name}`}
        className="relative bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-2xl w-full max-w-2xl animate-fade-in overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">{file.name}</h3>
          <button
            onClick={onClose}
            aria-label="Close preview"
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[hsl(var(--accent))] transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
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
              <p className="font-medium">{formatSize(file.sizeBytes)}</p>
            </div>
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
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => {
                void navigator.clipboard.writeText(absoluteUrl).then(onCopied);
              }}
            >
              <Copy className="w-3.5 h-3.5" aria-hidden="true" /> Copy URL
            </Button>
            <Button size="sm" variant="outline" className="gap-1" asChild>
              <a href={file.url} download={file.name}>
                <Download className="w-3.5 h-3.5" aria-hidden="true" /> Download
              </a>
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
  const [files, setFiles] = React.useState<MediaFile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [forbidden, setForbidden] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [actionMessage, setActionMessage] = React.useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<MediaFile | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const announce = React.useCallback((kind: 'success' | 'error', text: string) => {
    setActionMessage({ kind, text });
    window.setTimeout(() => setActionMessage(null), 4000);
  }, []);

  const load = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setForbidden(false);
    try {
      const res = await fetch('/api/media?perPage=100');
      if (res.status === 401 || res.status === 403) {
        setForbidden(true);
        return;
      }
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = (await res.json()) as { data?: ApiMediaRecord[] };
      setFiles((data.data ?? []).map(toMediaFile));
    } catch {
      setLoadError('Could not load your media library. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const handleUpload = React.useCallback(
    async (fl: FileList) => {
      setUploading(true);
      let failures = 0;
      for (const file of Array.from(fl)) {
        const fd = new FormData();
        fd.append('file', file);
        if (selectedFolder) fd.append('folder', `/${selectedFolder.toLowerCase()}`);
        try {
          const res = await fetch('/api/media', { method: 'POST', body: fd });
          if (!res.ok) failures++;
        } catch {
          failures++;
        }
      }
      setUploading(false);
      if (failures > 0) {
        announce('error', `${failures} of ${fl.length} file(s) failed to upload.`);
      } else {
        announce('success', `${fl.length} file(s) uploaded.`);
      }
      await load();
    },
    [selectedFolder, announce, load],
  );

  const handleDelete = React.useCallback(async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/media/${pendingDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      setFiles((prev) => prev.filter((f) => f.id !== pendingDelete.id));
      if (preview?.id === pendingDelete.id) setPreview(null);
      announce('success', `"${pendingDelete.name}" deleted.`);
      setPendingDelete(null);
    } catch {
      announce('error', `Could not delete "${pendingDelete.name}". Try again.`);
    } finally {
      setDeleting(false);
    }
  }, [pendingDelete, preview, announce]);

  const folders = React.useMemo(
    () => Array.from(new Set(files.map((f) => f.folder).filter((f): f is string => !!f))).sort((a, b) => a.localeCompare(b)),
    [files],
  );

  const filtered = files.filter((f) => {
    const matchFolder = selectedFolder === null || f.folder === selectedFolder;
    const matchSearch = !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFolder && matchSearch;
  });

  const totalBytes = files.reduce((sum, f) => sum + f.sizeBytes, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Media Library</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            {files.length} files · {formatSize(totalBytes)} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid'}
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" aria-hidden="true" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Action feedback */}
      {actionMessage && (
        <div
          role={actionMessage.kind === 'error' ? 'alert' : 'status'}
          className={cn(
            'text-sm rounded-md border px-3 py-2',
            actionMessage.kind === 'error'
              ? 'border-[hsl(var(--destructive)/0.4)] text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.06)]'
              : 'border-[hsl(var(--border))] text-[hsl(var(--foreground))] bg-[hsl(var(--muted)/0.3)]',
          )}
        >
          {actionMessage.text}
        </div>
      )}

      {/* Upload zone */}
      <UploadDropzone onDrop={(fl) => void handleUpload(fl)} uploading={uploading} />

      <div className="flex gap-6">
        {/* Sidebar folders */}
        <div className="w-44 flex-shrink-0 space-y-1">
          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Folders</p>
          <button
            onClick={() => setSelectedFolder(null)}
            aria-pressed={selectedFolder === null}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
              selectedFolder === null
                ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]',
            )}
          >
            <Folder className="w-4 h-4" aria-hidden="true" /> All Files
          </button>
          {folders.map((folder) => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder === selectedFolder ? null : folder)}
              aria-pressed={selectedFolder === folder}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                selectedFolder === folder
                  ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]',
              )}
            >
              <Folder className="w-4 h-4" aria-hidden="true" /> {folder}
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              aria-label="Search files"
              className="w-full max-w-xs h-9 pl-9 pr-3 text-sm rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>

          {/* Async states */}
          {forbidden ? (
            <PermissionDeniedState />
          ) : loading ? (
            <LoadingState label="Loading media…" />
          ) : loadError ? (
            <ErrorState message={loadError} onRetry={() => void load()} />
          ) : filtered.length === 0 ? (
            files.length === 0 ? (
              <EmptyState
                title="No media yet"
                description="Upload your first file using the dropzone above."
              />
            ) : (
              <EmptyState
                filtered
                title="No files match"
                description="Try a different search term or folder."
              />
            )
          ) : viewMode === 'grid' ? (
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
                        <Icon className="w-10 h-10 text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium truncate">{file.name}</p>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{formatSize(file.sizeBytes)}</p>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); setPendingDelete(file); }}
                        aria-label={`Delete ${file.name}`}
                        className="w-6 h-6 bg-black/60 rounded text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" aria-hidden="true" />
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
                        <Icon className="w-4 h-4 text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {file.folder ?? 'Root'} · {formatSize(file.sizeBytes)}
                      </p>
                    </div>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{file.createdAt}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${file.name}`}
                      className="w-7 h-7 opacity-0 group-hover:opacity-100 focus:opacity-100 text-[hsl(var(--destructive))]"
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); setPendingDelete(file); }}
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preview modal */}
      <PreviewModal
        file={preview}
        onClose={() => setPreview(null)}
        onCopied={() => announce('success', 'URL copied to clipboard.')}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete media file"
        description={
          pendingDelete
            ? `"${pendingDelete.name}" will be permanently deleted. This cannot be undone.`
            : ''
        }
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
