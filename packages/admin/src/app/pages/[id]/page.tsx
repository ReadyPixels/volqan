'use client';

/**
 * @file app/pages/[id]/page.tsx
 * @description Edit an existing page with the visual builder.
 * Loads from GET /api/pages/[id], saves via PATCH, publishes via PATCH { status }.
 */

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PageBuilder } from '@/components/page-builder/PageBuilder';
import { ErrorState } from '@/components/ui/async-states';
import type { Block, Page } from '@/types/page-builder';

/** API returns dates serialized as strings; revive them for the builder. */
function revivePage(raw: Record<string, unknown>): Page {
  const page = raw as unknown as Page;
  return {
    ...page,
    createdAt: new Date(raw.createdAt as string),
    updatedAt: new Date(raw.updatedAt as string),
    publishedAt: raw.publishedAt ? new Date(raw.publishedAt as string) : undefined,
  } as Page;
}

export default function EditPagePage() {
  const params = useParams<{ id: string }>();
  const [page, setPage] = React.useState<Page | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    setLoadError(null);
    try {
      const res = await fetch(`/api/pages/${encodeURIComponent(params.id)}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const body = (await res.json()) as { data: Record<string, unknown> };
      setPage(revivePage(body.data));
    } catch {
      setLoadError('Could not load this page. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(blocks: Block[], meta: Page['meta']) {
    if (!page) return;
    setSaveError(null);
    const res = await fetch(`/api/pages/${encodeURIComponent(page.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks, meta }),
    });
    if (!res.ok) {
      setSaveError('Save failed. Your changes are still in the editor — try saving again.');
      throw new Error(`Save failed (${res.status})`);
    }
    const body = (await res.json()) as { data: Record<string, unknown> };
    setPage(revivePage(body.data));
  }

  async function handlePublish() {
    if (!page) return;
    setSaveError(null);
    const res = await fetch(`/api/pages/${encodeURIComponent(page.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'published' }),
    });
    if (!res.ok) {
      setSaveError('Publish failed. The page was not published — try again.');
      throw new Error(`Publish failed (${res.status})`);
    }
    const body = (await res.json()) as { data: Record<string, unknown> };
    setPage(revivePage(body.data));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" role="status" aria-live="polite">
        <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
        <span className="sr-only">Loading page…</span>
      </div>
    );
  }

  if (loadError) {
    return <ErrorState message={loadError} onRetry={() => void load()} />;
  }

  if (notFound || !page) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">Page not found</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
          The page with ID &ldquo;{params.id}&rdquo; does not exist.
        </p>
        <Link href="/pages">
          <button className="inline-flex items-center gap-2 text-sm text-[hsl(var(--primary))] hover:underline">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to Pages
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="-m-6 h-[calc(100vh-56px)] flex flex-col">
      {saveError && (
        <div role="alert" className="text-sm border-b border-[hsl(var(--destructive)/0.4)] text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.06)] px-4 py-2">
          {saveError}
        </div>
      )}
      <PageBuilder
        page={page}
        onSave={handleSave}
        onPublish={handlePublish}
        onPreview={() => window.open(page.slug, '_blank')}
      />
    </div>
  );
}
