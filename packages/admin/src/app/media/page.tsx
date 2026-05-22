'use client';

import * as React from 'react';
import {
  Upload, Grid, List, Search, Folder, Image, File, Film,
  Trash2, Download, Copy, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type MediaFileType = 'image' | 'video' | 'file';

interface MediaFile {
  id: string;
  name: string;
  originalName?: string;
  type: MediaFileType;
  size: string;
  dimensions?: string;
  folder: string | null;
  url: string;
  createdAt: string;
}

const FOLDERS = ['Images', 'Documents', 'Videos', 'Products'];

const FILE_ICON: Record<MediaFileType, React.ComponentType<{ className?: string }>> = {
  image: Image,
  video: Film,
  file: File,
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

// ---------------------------------------------------------------------------
// Dropzone
// ---------------------------------------------------------------------------

function UploadDropzone({ onDrop, uploading }: { onDrop: (files: FileList) => void; uploading: boolean }) {
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
        uploading && 'opacity-60 pointer-events-none',
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

function PreviewModal({ file, onClose }: { file: MediaFile | null; onClose: () => void }) {
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
              <p className="font-medium">{relativeTime(file.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-[hsl(var(--border))]">
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => navigator.clipboard.writeText(window.location.origin + file.url)}
            >
              <Copy className="w-3.5 h-3.5" /> Copy URL
            </Button>
            <a href={file.url} download={file.name}>
              <Button size="sm" variant="outline" className="gap-1">
                <Download className="w-3.5 h-3.5" /> Download
              </Button>
            </a>
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
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const loadMedia = () => {
    fetch('/api/media')
      .then((r) => r.ok ? r.json() : [])
      .then((rows: MediaFile[]) => setFiles(rows))
      .catch(() => setFiles([]))
      .finally(() => setLoading(false));
  };

  React.useEffect(() => { loadMedia(); }, []);

  const handleUpload = async (fileList: FileList) => {
    setUploading(true);
    setUploadError(null);
    const results: MediaFile[] = [];
    for (const file of Array.from(fileList)) {
      const fd = new FormData();
      fd.append('file', file);
      if (selectedFolder) fd.append('folder', selectedFolder);
      try {
        const res = await fetch('/api/media', { method: 'POST', body: fd });
        if (res.ok) {
          const data = await res.json() as MediaFile;
          results.push(data);
        } else {
          setUploadError(`Failed to upload ${file.name}`);
        }
      } catch {
        setUploadError(`Upload error for ${file.name}`);
      }
    }
    if (results.length) setFiles((prev) => [...results, ...prev]);
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setFiles((prev) => prev.filter((f) => f.id !== id));
      if (preview?.id === id) setPreview(null);
    }
  };

  const filtered = files.filter((f) => {
    const matchFolder = selectedFolder === null || f.folder === selectedFolder;
    const matchSearch = !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFolder && matchSearch;
  });

  const totalMB = files.reduce((sum, f) => {
    const num = parseFloat(f.size);
    const unit = f.size.slice(-2);
    return sum + (unit === 'MB' ? num : unit === 'KB' ? num / 1024 : num);
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Media Library</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            {loading ? '…' : `${files.length} files · ${totalMB.toFixed(1)} MB total`}
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

      <UploadDropzone onDrop={handleUpload} uploading={uploading} />

      {uploadError && (
        <div className="rounded-md bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.3)] px-4 py-2 text-sm text-[hsl(var(--destructive))]">
          {uploadError}
        </div>
      )}

      <div className="flex gap-6">
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

        <div className="flex-1 min-w-0 space-y-4">
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

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-[hsl(var(--border))] overflow-hidden animate-pulse">
                  <div className="aspect-square bg-[hsl(var(--muted))]" />
                  <div className="p-2 space-y-1">
                    <div className="h-3 bg-[hsl(var(--muted))] rounded w-3/4" />
                    <div className="h-2 bg-[hsl(var(--muted))] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Upload className="w-10 h-10 text-[hsl(var(--muted-foreground))] mb-3 opacity-40" />
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">No files yet</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                Upload files using the dropzone above.
              </p>
            </div>
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
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
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
                        onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
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
                        {file.folder ?? 'Root'} · {file.size}
                      </p>
                    </div>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{relativeTime(file.createdAt)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 opacity-0 group-hover:opacity-100 text-[hsl(var(--destructive))]"
                      onClick={(e: any) => { e.stopPropagation(); handleDelete(file.id); }}
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

      <PreviewModal file={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
