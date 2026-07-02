'use client';

/**
 * @file app/content/[slug]/page.tsx
 * @description Content entries list for a specific content type.
 * Entries load from /api/content/[type]; delete and bulk delete hit the real API.
 */

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/ui/data-table';
import { LoadingState, ErrorState, EmptyState, PermissionDeniedState } from '@/components/ui/async-states';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EntryStatus = 'published' | 'draft' | 'scheduled' | 'archived';

interface ContentEntryRow {
  id: string;
  title: string;
  status: EntryStatus;
  authorId: string | null;
  updatedAt: string;
  createdAt: string;
}

interface ApiEntry {
  id: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  slug: string | null;
  authorId: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  data: Record<string, unknown>;
}

function toRow(e: ApiEntry): ContentEntryRow {
  let status: EntryStatus =
    e.status === 'PUBLISHED' ? 'published' : e.status === 'ARCHIVED' ? 'archived' : 'draft';
  if (status === 'draft' && e.scheduledAt && new Date(e.scheduledAt) > new Date()) {
    status = 'scheduled';
  }
  const title =
    (typeof e.data?.title === 'string' && e.data.title) ||
    (typeof e.data?.name === 'string' && e.data.name) ||
    e.slug ||
    e.id;
  return {
    id: e.id,
    title,
    status,
    authorId: e.authorId,
    updatedAt: new Date(e.updatedAt).toLocaleDateString(),
    createdAt: new Date(e.createdAt).toLocaleDateString(),
  };
}

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

  const [data, setData] = React.useState<ContentEntryRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [forbidden, setForbidden] = React.useState(false);
  const [notFoundType, setNotFoundType] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [pendingDelete, setPendingDelete] = React.useState<{ ids: string[]; label: string } | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setLoadError(null);
    setForbidden(false);
    setNotFoundType(false);
    try {
      const res = await fetch(`/api/content/${encodeURIComponent(slug)}?perPage=100`);
      if (res.status === 401 || res.status === 403) {
        setForbidden(true);
        return;
      }
      if (res.status === 404) {
        setNotFoundType(true);
        return;
      }
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const body = (await res.json()) as { data?: ApiEntry[] };
      setData((body.data ?? []).map(toRow));
    } catch {
      setLoadError('Could not load entries. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const confirmDelete = React.useCallback(async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setActionError(null);
    let failures = 0;
    for (const id of pendingDelete.ids) {
      try {
        const res = await fetch(`/api/content/${encodeURIComponent(slug)}/${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (!res.ok) failures++;
      } catch {
        failures++;
      }
    }
    setDeleting(false);
    setPendingDelete(null);
    if (failures > 0) {
      setActionError(`${failures} entr${failures === 1 ? 'y' : 'ies'} could not be deleted. Refreshing list.`);
    }
    await load();
  }, [pendingDelete, slug, load]);

  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data;
    return data.filter((entry) => entry.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [data, searchQuery]);

  const columns: Column<ContentEntryRow>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      accessor: (row: ContentEntryRow) => (
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
      accessor: (row: ContentEntryRow) => (
        <Badge variant={STATUS_BADGE[row.status] ?? 'default'}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      width: '120px',
      accessor: (row: ContentEntryRow) => (
        <span className="text-[hsl(var(--muted-foreground))] text-xs">{row.updatedAt}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      accessor: (row: ContentEntryRow) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <Link href={`/content/${slug}/${row.id}`}>
            <Button variant="ghost" size="icon" className="w-7 h-7" aria-label={`Edit ${row.title}`}>
              <Edit className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-[hsl(var(--destructive))]"
            aria-label={`Delete ${row.title}`}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setPendingDelete({ ids: [row.id], label: `"${row.title}"` });
            }}
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
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
            <Plus className="w-4 h-4" aria-hidden="true" />
            New {typeName}
          </Button>
        </Link>
      </div>

      {actionError && (
        <div role="alert" className="text-sm rounded-md border border-[hsl(var(--destructive)/0.4)] text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.06)] px-3 py-2">
          {actionError}
        </div>
      )}

      {/* Stats bar */}
      {!loading && !loadError && !forbidden && !notFoundType && (
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
      )}

      {/* Async states + table */}
      {forbidden ? (
        <PermissionDeniedState />
      ) : notFoundType ? (
        <ErrorState message={`Content type "${slug}" was not found.`} />
      ) : loading ? (
        <LoadingState label="Loading entries…" />
      ) : loadError ? (
        <ErrorState message={loadError} onRetry={() => void load()} />
      ) : data.length === 0 ? (
        <EmptyState
          title={`No ${typeName.toLowerCase()} entries yet`}
          description="Create your first entry to get started."
          action={
            <Link href={`/content/${slug}/new`}>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4" aria-hidden="true" /> New entry
              </Button>
            </Link>
          }
        />
      ) : filteredData.length === 0 ? (
        <EmptyState filtered title="No entries match" description="Try a different search term." />
      ) : (
        <DataTable
          data={filteredData}
          columns={columns}
          rowKey={(r: ContentEntryRow) => r.id}
          searchable
          searchPlaceholder={`Search ${typeName.toLowerCase()} entries...`}
          onSearch={setSearchQuery}
          selectable
          onDeleteSelected={(ids: string[]) =>
            setPendingDelete({ ids, label: `${ids.length} selected entr${ids.length === 1 ? 'y' : 'ies'}` })
          }
          emptyMessage={`No ${typeName.toLowerCase()} entries found.`}
        />
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete ${typeName.toLowerCase()} entr${(pendingDelete?.ids.length ?? 1) === 1 ? 'y' : 'ies'}`}
        description={
          pendingDelete
            ? `${pendingDelete.label} will be permanently deleted. This cannot be undone.`
            : ''
        }
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
