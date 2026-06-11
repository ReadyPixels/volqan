'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Edit3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type EntryStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

interface RecentEntry {
  id: string;
  data: Record<string, unknown>;
  status: EntryStatus;
  slug: string | null;
  updatedAt: string;
  contentType: { name: string; slug: string };
  author: { name: string | null; email: string } | null;
}

const STATUS_BADGE: Record<EntryStatus, 'success' | 'default' | 'warning'> = {
  PUBLISHED: 'success',
  DRAFT:     'default',
  ARCHIVED:  'warning',
};

const STATUS_DOT: Record<EntryStatus, string> = {
  PUBLISHED: 'bg-emerald-500',
  DRAFT:     'bg-gray-400',
  ARCHIVED:  'bg-amber-500',
};

function initials(name: string | null, email: string): string {
  if (name) return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500'];

function avatarColor(email: string): string {
  let hash = 0;
  for (const c of email) hash = (hash * 31 + (c.codePointAt(0) ?? 0)) & 0xffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function RecentEntries() {
  const [entries, setEntries] = React.useState<RecentEntry[]>([]);

  React.useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json() as Promise<{ data: { recentEntries: RecentEntry[] } }>)
      .then(({ data }) => setEntries(data.recentEntries ?? []))
      .catch(() => null);
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
        {entries.length === 0 ? (
          <p className="px-6 py-8 text-sm text-[hsl(var(--muted-foreground))]">No recent entries.</p>
        ) : (
          <div className="divide-y divide-[hsl(var(--border))]">
            {entries.map((entry) => {
              const displayName = entry.author?.name ?? entry.author?.email ?? 'Unknown';
              const color = avatarColor(entry.author?.email ?? entry.id);
              const title = (entry.data?.title ?? entry.data?.name ?? entry.slug ?? entry.id) as string;
              return (
                <div key={entry.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-[hsl(var(--accent))] transition-colors group">
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0', color)}>
                    {initials(entry.author?.name ?? null, entry.author?.email ?? entry.id)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', STATUS_DOT[entry.status])} />
                      <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate group-hover:text-[hsl(var(--primary))] transition-colors">
                        {String(title)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">{entry.contentType.name}</span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">·</span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">{displayName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={STATUS_BADGE[entry.status]} className="hidden sm:flex">
                      {entry.status.toLowerCase()}
                    </Badge>
                    <span className="text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap hidden md:block">
                      {new Date(entry.updatedAt).toLocaleDateString()}
                    </span>
                    <Link href={`/content/${entry.contentType.slug}/${entry.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
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
