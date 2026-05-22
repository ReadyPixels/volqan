'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Edit3, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RecentEntry {
  id: string;
  data: string;
  status: string;
  slug: string;
  updatedAt: string;
  contentType: string;
  contentTypeSlug: string;
  author: string;
}

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'default' | 'info'> = {
  published: 'success',
  draft: 'default',
  scheduled: 'info',
  archived: 'warning',
};

const STATUS_DOT: Record<string, string> = {
  published: 'bg-emerald-500',
  draft: 'bg-gray-400',
  scheduled: 'bg-blue-500',
  archived: 'bg-amber-500',
};

const AVATAR_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500', 'bg-pink-500'];

function avatarColor(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name: string): string {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

function entryTitle(entry: RecentEntry): string {
  try {
    const parsed = JSON.parse(entry.data) as Record<string, unknown>;
    const title = parsed['title'] ?? parsed['name'] ?? parsed['slug'];
    if (typeof title === 'string' && title.trim()) return title.trim();
  } catch { /* ignore */ }
  return `${entry.contentType} #${entry.id.slice(-6)}`;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RecentEntries() {
  const [entries, setEntries] = React.useState<RecentEntry[] | null>(null);

  React.useEffect(() => {
    fetch('/api/dashboard/recent-entries')
      .then((r) => r.ok ? r.json() : [])
      .then((data: RecentEntry[]) => setEntries(data))
      .catch(() => setEntries([]));
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Content</CardTitle>
            <CardDescription className="mt-0.5">Latest entries across all content types</CardDescription>
          </div>
          <Link href="/content">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {entries === null ? (
          <div className="px-6 py-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--muted))]" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-[hsl(var(--muted))] rounded w-3/4" />
                  <div className="h-3 bg-[hsl(var(--muted))] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="px-6 py-10 flex flex-col items-center gap-3 text-center">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center">
              <FileText className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">No entries yet</p>
            <Link href="/content">
              <Button variant="outline" size="sm">Create your first entry</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--border))]">
            {entries.map((entry) => {
              const title = entryTitle(entry);
              const color = avatarColor(entry.author);
              const inits = initials(entry.author);
              const dot = STATUS_DOT[entry.status] ?? 'bg-gray-400';
              const badge = STATUS_BADGE[entry.status] ?? 'default';

              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-[hsl(var(--accent))] transition-colors group"
                >
                  <div
                    className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0', color)}
                    title={entry.author}
                  >
                    {inits}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dot)} />
                      <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate group-hover:text-[hsl(var(--primary))] transition-colors">
                        {title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">{entry.contentType}</span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">·</span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">{entry.author}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={badge} className="hidden sm:flex">{entry.status}</Badge>
                    <span className="text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap hidden md:block">
                      {relativeTime(entry.updatedAt)}
                    </span>
                    <Link
                      href={`/content/${entry.contentTypeSlug}/${entry.id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
