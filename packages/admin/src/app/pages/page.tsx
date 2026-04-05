/**
 * @file app/pages/page.tsx
 * @description Page manager — list, create, and delete pages.
 */

import type React from 'react';
import Link from 'next/link';
import {
  Plus,
  FileText,
  Globe,
  Clock,
  Archive,
  Pencil,
  Eye,
  MoreHorizontal,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ---------------------------------------------------------------------------
// Mock page data (replace with real API calls)
// ---------------------------------------------------------------------------

type PageStatus = 'draft' | 'published' | 'scheduled' | 'archived';

interface MockPage {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  blocks: number;
  author: string;
  updatedAt: string;
  publishedAt?: string;
}

const MOCK_PAGES: MockPage[] = [
  { id: '1', title: 'Home', slug: '/', status: 'published', blocks: 12, author: 'Alice', updatedAt: '2 hours ago', publishedAt: 'Jan 15, 2025' },
  { id: '2', title: 'About Us', slug: '/about', status: 'published', blocks: 8, author: 'Bob', updatedAt: '1 day ago', publishedAt: 'Jan 10, 2025' },
  { id: '3', title: 'Pricing', slug: '/pricing', status: 'draft', blocks: 5, author: 'Alice', updatedAt: '3 days ago' },
  { id: '4', title: 'Contact', slug: '/contact', status: 'published', blocks: 3, author: 'Charlie', updatedAt: '5 days ago', publishedAt: 'Dec 20, 2024' },
  { id: '5', title: 'Summer Campaign 2025', slug: '/summer-2025', status: 'scheduled', blocks: 7, author: 'David', updatedAt: '1 week ago' },
  { id: '6', title: 'Old Landing Page', slug: '/old-landing', status: 'archived', blocks: 4, author: 'Alice', updatedAt: '3 months ago' },
];

const STATUS_CONFIG: Record<PageStatus, { label: string; variant: 'success' | 'default' | 'info' | 'warning'; icon: React.ComponentType<{ className?: string }> }> = {
  published: { label: 'Published', variant: 'success', icon: Globe },
  draft: { label: 'Draft', variant: 'default', icon: FileText },
  scheduled: { label: 'Scheduled', variant: 'info', icon: Calendar },
  archived: { label: 'Archived', variant: 'warning', icon: Archive },
};

// ---------------------------------------------------------------------------
// Page manager component
// ---------------------------------------------------------------------------

export default function PagesPage() {
  const published = MOCK_PAGES.filter((p) => p.status === 'published').length;
  const drafts = MOCK_PAGES.filter((p) => p.status === 'draft').length;
  const scheduled = MOCK_PAGES.filter((p) => p.status === 'scheduled').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Pages</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Build and manage your site pages with the visual builder
          </p>
        </div>
        <Link href="/pages/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Page
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Pages', value: MOCK_PAGES.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Published', value: published, icon: Globe, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Drafts', value: drafts, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Scheduled', value: scheduled, icon: Calendar, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4.5 h-4.5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-[hsl(var(--foreground))]">{stat.value}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pages list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Pages</CardTitle>
          <CardDescription>Click a page to open the visual builder</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-[hsl(var(--border))]">
            {MOCK_PAGES.map((page) => {
              const statusConfig = STATUS_CONFIG[page.status];
              const StatusIcon = statusConfig.icon;
              return (
                <div
                  key={page.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-[hsl(var(--accent))] transition-colors group"
                >
                  {/* Status icon */}
                  <div className="w-8 h-8 rounded-md bg-[hsl(var(--muted))] flex items-center justify-center flex-shrink-0">
                    <StatusIcon className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                  </div>

                  {/* Page info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                        {page.title}
                      </p>
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{page.slug}</p>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">·</span>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{page.blocks} blocks</p>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">·</span>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{page.author}</p>
                    </div>
                  </div>

                  {/* Updated at */}
                  <div className="hidden sm:block text-right flex-shrink-0">
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Updated {page.updatedAt}</p>
                    {page.publishedAt && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Published {page.publishedAt}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/pages/${page.id}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit page">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    {page.status === 'published' && (
                      <a href={page.slug} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="View live page">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
