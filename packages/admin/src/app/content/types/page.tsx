'use client';

/**
 * @file app/content/types/page.tsx
 * @description Content type management. Types load from /api/content/types;
 * delete hits DELETE /api/content/types/[slug].
 */

import * as React from 'react';
import Link from 'next/link';
import { Plus, Trash2, Database, Hash, Type, ToggleLeft, Calendar, Image, List, Link2, Braces } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState, ErrorState, EmptyState, PermissionDeniedState } from '@/components/ui/async-states';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

// ---------------------------------------------------------------------------
// Types (shape of GET /api/content/types)
// ---------------------------------------------------------------------------

interface FieldDef {
  name: string;
  label?: string;
  type: string;
  required?: boolean;
}

interface ContentTypeDef {
  slug: string;
  name: string;
  description?: string;
  fields: FieldDef[];
}

const FIELD_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  TEXT: Type,
  RICHTEXT: Type,
  PASSWORD: Type,
  SLUG: Link2,
  URL: Link2,
  EMAIL: Type,
  NUMBER: Hash,
  BOOLEAN: ToggleLeft,
  DATETIME: Calendar,
  DATE: Calendar,
  IMAGE: Image,
  FILE: Image,
  SELECT: List,
  MULTISELECT: List,
  JSON: Braces,
  RELATION: Database,
  COLOR: Type,
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ContentTypesPage() {
  const [types, setTypes] = React.useState<ContentTypeDef[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [forbidden, setForbidden] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<ContentTypeDef | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setForbidden(false);
    try {
      const res = await fetch('/api/content/types');
      if (res.status === 401 || res.status === 403) {
        setForbidden(true);
        return;
      }
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const body = (await res.json()) as { data?: ContentTypeDef[] };
      setTypes(body.data ?? []);
    } catch {
      setLoadError('Could not load content types. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const confirmDelete = React.useCallback(async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/content/types/${encodeURIComponent(pendingDelete.slug)}`, { method: 'DELETE' });
      if (res.status === 403) {
        setActionError('You do not have permission to delete content types.');
        return;
      }
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      setTypes((prev) => prev.filter((t) => t.slug !== pendingDelete.slug));
    } catch {
      setActionError(`Could not delete "${pendingDelete.name}". Try again.`);
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  }, [pendingDelete]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Content Types</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Define the structure of your content with custom field schemas.
          </p>
        </div>
        <Link href="/content/types/new">
          <Button size="sm">
            <Plus className="w-4 h-4" aria-hidden="true" />
            New Type
          </Button>
        </Link>
      </div>

      {actionError && (
        <div role="alert" className="text-sm rounded-md border border-[hsl(var(--destructive)/0.4)] text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.06)] px-3 py-2">
          {actionError}
        </div>
      )}

      {/* Content types */}
      {forbidden ? (
        <PermissionDeniedState />
      ) : loading ? (
        <LoadingState label="Loading content types…" />
      ) : loadError ? (
        <ErrorState message={loadError} onRetry={() => void load()} />
      ) : types.length === 0 ? (
        <EmptyState
          title="No content types yet"
          description="Create your first content type to start managing structured content."
          action={
            <Link href="/content/types/new">
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4" aria-hidden="true" /> New Type
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {types.map((type) => (
            <Card key={type.slug}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                      <Database className="w-4.5 h-4.5 text-[hsl(var(--primary))]" aria-hidden="true" />
                    </div>
                    <div>
                      <CardTitle>{type.name}</CardTitle>
                      <CardDescription className="mt-0.5">{type.description ?? `/api/content/${type.slug}`}</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-[hsl(var(--destructive))]"
                    aria-label={`Delete ${type.name}`}
                    onClick={() => setPendingDelete(type)}
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))] mb-2">
                    <span>{type.fields.length} fields</span>
                    <span className="font-mono">{type.slug}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {type.fields.map((field) => {
                      const Icon = FIELD_ICONS[field.type] ?? Type;
                      return (
                        <div
                          key={field.name}
                          className="flex items-center gap-1 px-2 py-1 rounded-md bg-[hsl(var(--muted)/0.6)] text-xs"
                        >
                          <Icon className="w-3 h-3 text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
                          <span className="font-medium">{field.name}</span>
                          <span className="text-[hsl(var(--muted-foreground))]">{field.type.toLowerCase()}</span>
                          {field.required && <span className="text-[hsl(var(--destructive))]">*</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[hsl(var(--border))] flex items-center justify-between">
                  <Link href={`/content/${type.slug}`}>
                    <Button variant="outline" size="sm">
                      Browse Entries
                    </Button>
                  </Link>
                  <Link href={`/content/${type.slug}/new`}>
                    <Button variant="ghost" size="sm">
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      Add Entry
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete content type"
        description={
          pendingDelete
            ? `"${pendingDelete.name}" and all of its entries will be permanently deleted. This cannot be undone.`
            : ''
        }
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
