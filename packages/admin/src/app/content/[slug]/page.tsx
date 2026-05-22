'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/ui/data-table';

interface ContentEntry {
  id: string;
  title: string;
  status: string;
  author: string;
  updatedAt: string;
  createdAt: string;
}

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'default' | 'info'> = {
  published: 'success',
  draft: 'default',
  scheduled: 'info',
  archived: 'warning',
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ContentEntriesPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const typeName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Content';

  const [data, setData] = React.useState<ContentEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    if (!slug) return;
    fetch(`/api/content-types/${slug}/entries`)
      .then((r) => r.ok ? r.json() : [])
      .then((rows: ContentEntry[]) => setData(rows))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [slug]);

  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data;
    const q = searchQuery.toLowerCase();
    return data.filter((e) =>
      e.title.toLowerCase().includes(q) || e.author.toLowerCase().includes(q),
    );
  }, [data, searchQuery]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    const res = await fetch(`/api/content-types/${slug}/entries/${id}`, { method: 'DELETE' });
    if (res.ok) setData((prev) => prev.filter((e) => e.id !== id));
  };

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
        <Badge variant={STATUS_BADGE[row.status] ?? 'default'}>{row.status}</Badge>
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
        <span className="text-[hsl(var(--muted-foreground))] text-xs">{relativeTime(row.updatedAt)}</span>
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
            onClick={(e: any) => { e.stopPropagation(); handleDelete(row.id); }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">{typeName}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            {loading ? '…' : `${filteredData.length} entries`}
          </p>
        </div>
        <Link href={`/content/${slug}/new`}>
          <Button size="sm">
            <Plus className="w-4 h-4" />
            New {typeName}
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-6 py-3 px-4 rounded-lg bg-[hsl(var(--muted)/0.4)] text-sm">
        {[
          { label: 'Published', color: 'text-emerald-600' },
          { label: 'Draft', color: 'text-[hsl(var(--muted-foreground))]' },
          { label: 'Scheduled', color: 'text-sky-600' },
          { label: 'Archived', color: 'text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className={`font-bold ${s.color}`}>
              {data.filter((e) => e.status === s.label.toLowerCase()).length}
            </span>
            <span className="text-[hsl(var(--muted-foreground))]">{s.label}</span>
          </div>
        ))}
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        rowKey={(r: any) => r.id}
        searchable
        searchPlaceholder={`Search ${typeName.toLowerCase()} entries...`}
        onSearch={setSearchQuery}
        selectable
        onDeleteSelected={(ids: any) => {
          Promise.all(ids.map((id: string) => fetch(`/api/content-types/${slug}/entries/${id}`, { method: 'DELETE' })))
            .then(() => setData((prev) => prev.filter((e) => !ids.includes(e.id))));
        }}
        emptyMessage={loading ? 'Loading…' : `No ${typeName.toLowerCase()} entries yet.`}
      />
    </div>
  );
}
