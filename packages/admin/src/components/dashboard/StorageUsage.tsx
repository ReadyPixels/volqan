/**
 * @file components/dashboard/StorageUsage.tsx
 * @description Storage usage indicator backed by real media file sizes.
 */

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HardDrive, Image, FileText, Video, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StorageCategory { label: string; bytes: number; }

interface DashboardStorageStats {
  totalStorageBytes: number;
  storageByCategory: StorageCategory[];
}

const CATEGORY_STYLE: Record<string, { icon: typeof Image; color: string; textColor: string }> = {
  Images: { icon: Image, color: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400' },
  Videos: { icon: Video, color: 'bg-violet-500', textColor: 'text-violet-600 dark:text-violet-400' },
  Documents: { icon: FileText, color: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400' },
  Audio: { icon: Music, color: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400' },
};

function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

export function StorageUsage() {
  const [stats, setStats] = React.useState<DashboardStorageStats | null>(null);

  React.useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json() as Promise<{ data: DashboardStorageStats }>)
      .then(({ data }) => setStats(data))
      .catch(() => null);
  }, []);

  const total = stats?.totalStorageBytes ?? 0;
  const categories = (stats?.storageByCategory ?? []).filter((c) => c.bytes > 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <CardTitle>Storage Usage</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <span className="text-2xl font-bold text-[hsl(var(--foreground))]">
            {stats ? formatBytes(total) : <span className="skeleton" style={{ display: 'inline-block', width: 64, height: 24, borderRadius: 4 }} />}
          </span>
          <span className="text-sm text-[hsl(var(--muted-foreground))] ml-1">used on local disk</span>
        </div>

        {stats && categories.length === 0 && (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">No media files uploaded yet.</p>
        )}

        {categories.length > 0 && (
          <div className="space-y-2.5">
            {categories.map((item) => {
              const style = CATEGORY_STYLE[item.label];
              const Icon = style?.icon ?? FileText;
              const pct = total > 0 ? Math.round((item.bytes / total) * 100) : 0;
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-[hsl(var(--muted))] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium text-[hsl(var(--foreground))]">{item.label}</span>
                      <span className={cn('text-xs font-medium', style?.textColor)}>{formatBytes(item.bytes)}</span>
                    </div>
                    <div className="h-1 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full', style?.color)} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <a
          href="/media"
          className="block text-center text-xs text-[hsl(var(--primary))] hover:underline"
        >
          Manage media library →
        </a>
      </CardContent>
    </Card>
  );
}
