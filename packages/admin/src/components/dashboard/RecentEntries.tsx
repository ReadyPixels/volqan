/**
 * @file components/dashboard/RecentEntries.tsx
 * @description Recent content entries table with author avatar, status badge, timestamp, and quick edit link.
 */

import Link from 'next/link';
import { ArrowRight, Edit3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface RecentEntry {
  id: string;
  title: string;
  type: string;
  status: 'published' | 'draft' | 'scheduled' | 'archived';
  author: string;
  authorInitials: string;
  authorColor: string;
  updatedAt: string;
  slug: string;
}

const RECENT_ENTRIES: RecentEntry[] = [
  { id: '1', title: 'Getting Started with Volqan CMS', type: 'Blog Post', status: 'published', author: 'Alice Martin', authorInitials: 'AM', authorColor: 'bg-blue-500', updatedAt: '2 minutes ago', slug: 'post' },
  { id: '2', title: 'New Feature: AI Content Generation', type: 'Blog Post', status: 'draft', author: 'Bob Chen', authorInitials: 'BC', authorColor: 'bg-violet-500', updatedAt: '1 hour ago', slug: 'post' },
  { id: '3', title: 'MacBook Pro M4 Max Review', type: 'Product', status: 'published', author: 'Charlie Davis', authorInitials: 'CD', authorColor: 'bg-amber-500', updatedAt: '3 hours ago', slug: 'product' },
  { id: '4', title: 'Privacy Policy', type: 'Page', status: 'published', author: 'Alice Martin', authorInitials: 'AM', authorColor: 'bg-blue-500', updatedAt: '1 day ago', slug: 'page' },
  { id: '5', title: 'Summer Sale 2025', type: 'Banner', status: 'scheduled', author: 'David Kim', authorInitials: 'DK', authorColor: 'bg-emerald-500', updatedAt: '2 days ago', slug: 'banner' },
];

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RecentEntries() {
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
        <div className="divide-y divide-[hsl(var(--border))]">
          {RECENT_ENTRIES.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-4 px-6 py-3.5 hover:bg-[hsl(var(--accent))] transition-colors group"
            >
              {/* Author avatar */}
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0',
                  entry.authorColor,
                )}
                title={entry.author}
              >
                {entry.authorInitials}
              </div>

              {/* Entry info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', STATUS_DOT[entry.status])} />
                  <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate group-hover:text-[hsl(var(--primary))] transition-colors">
                    {entry.title}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{entry.type}</span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">·</span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{entry.author}</span>
                </div>
              </div>

              {/* Status + time */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <Badge variant={STATUS_BADGE[entry.status] ?? 'default'} className="hidden sm:flex">
                  {entry.status}
                </Badge>
                <span className="text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap hidden md:block">
                  {entry.updatedAt}
                </span>
                <Link
                  href={`/content/${entry.slug}/${entry.id}`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Edit3 className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
