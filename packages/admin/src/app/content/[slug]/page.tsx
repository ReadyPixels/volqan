'use client';

/**
 * @file app/content/[slug]/page.tsx
 * @description Content entries list for a specific content type.
 */

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/ui/data-table';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface ContentEntry {
  id: string;
  title: string;
  status: 'published' | 'draft' | 'scheduled' | 'archived';
  author: string;
  updatedAt: string;
  createdAt: string;
}

const MOCK_ENTRIES: ContentEntry[] = Array.from({ length: 42 }, (_, i) => ({
  id: String(i + 1),
  title: [
    'Getting Started Guide',
    'Product Announcement',
    'Monthly Newsletter',
    'Case Study: TechCorp',
    'Developer Documentation',
    'Partnership Update',
  ][i % 6] + ` #${i + 1}`,
  status: (['published', 'draft', 'published', 'scheduled', 'published', 'archived'] as const)[i % 6],
  author: ['Alice', 'Bob', 'Charlie', 'David'][i % 4],
  updatedAt: `${(i % 30) + 1}d ago`,
  createdAt: `${(i % 60) + 1}d ago`,
}));

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'default' | 'info'> = {
  published: 'success',
  draft: 'default',
  scheduled: 'info',
  archived: 'warning',
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ContentEntriesPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const typeName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Content';

  const [data, setData] = React.useState(MOCK_ENTRIES);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data;
    return data.filter((entry) =>
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.author.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [data, searchQuery]);

  const columns: Column<ContentEntry>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      accessor: (row: any) => (
        <Link
          href={`/content/${slug}/${row.id}`}
          className="font-medium text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors"
        >
          {row.title}
        </Link>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      width: '120px',
      accessor: (row: any) => (
        <Badge variant={STATUS_BADGE[row.status] ?? 'default'}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'author',
      header: 'Author',
      sortable: true,
      width: '140px',
      accessor: (row: any) => (
        <span className="text-[hsl(var(--muted-foreground))]">{row.author}</span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      width: '120px',
      accessor: (row: any) => (
        <span className="text-[hsl(var(--muted-foreground))] text-xs">{row.updatedAt}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      accessor: (row: any) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/content/${slug}/${row.id}`}>
            <Button variant="ghost" size="icon" className="w-7 h-7" aria-label="Edit">
              <Edit className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-[hsl(var(--destructive))]"
            aria-label="Delete"
            onClick={(e: any) => {
              e.stopPropagation();
              setData((prev) => prev.filter((e: any) => e.id !== row.id));
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">{typeName}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            {filteredData.length} entries
          </p>
        </div>
        <Link href={`/content/${slug}/new`}>
          <Button size="sm">
            <Plus className="w-4 h-4" />
            New {typeName}
          </Button>
        </Link>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 py-3 px-4 rounded-lg bg-[hsl(var(--muted)/0.4)] text-sm">
        {[
          { label: 'Published', count: data.filter((e) => e.status === 'published').length, color: 'text-emerald-600' },
          { label: 'Draft', count: data.filter((e) => e.status === 'draft').length, color: 'text-[hsl(var(--muted-foreground))]' },
          { label: 'Scheduled', count: data.filter((e) => e.status === 'scheduled').length, color: 'text-sky-600' },
          { label: 'Archived', count: data.filter((e) => e.status === 'archived').length, color: 'text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className={`font-bold ${s.color}`}>{s.count}</span>
            <span className="text-[hsl(var(--muted-foreground))]">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Data table */}
      <DataTable
        data={filteredData}
        columns={columns}
        rowKey={(r: any) => r.id}
        searchable
        searchPlaceholder={`Search ${typeName.toLowerCase()} entries...`}
        onSearch={setSearchQuery}
        selectable
        onDeleteSelected={(ids: any) => setData((prev) => prev.filter((e: any) => !ids.includes(e.id)))}
        emptyMessage={`No ${typeName.toLowerCase()} entries found.`}
      />
    </div>
  );
}
