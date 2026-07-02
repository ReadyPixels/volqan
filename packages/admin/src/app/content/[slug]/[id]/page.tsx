'use client';

/**
 * @file app/content/[slug]/[id]/page.tsx
 * @description Edit a specific content entry, backed by /api/content/[type]/[id].
 */

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormField, type FormFieldDefinition } from '@/components/ui/form-field';
import { LoadingState, ErrorState } from '@/components/ui/async-states';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const DEFAULT_FIELDS: FormFieldDefinition[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'slug', label: 'Slug', type: 'text', required: true, description: 'URL-friendly identifier' },
  { key: 'content', label: 'Content', type: 'richtext' },
  { key: 'status', label: 'Status', type: 'select', options: [
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Published', value: 'PUBLISHED' },
    { label: 'Archived', value: 'ARCHIVED' },
  ]},
];

interface ApiEntry {
  id: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  slug: string | null;
  createdAt: string;
  updatedAt: string;
  data: Record<string, unknown>;
}

export default function EditContentEntryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const id = params?.id as string;
  const typeName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Content';

  const [entry, setEntry] = React.useState<ApiEntry | null>(null);
  const [formData, setFormData] = React.useState<Record<string, unknown>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/content/${encodeURIComponent(slug)}/${encodeURIComponent(id)}`);
      if (res.status === 404) {
        setLoadError('This entry no longer exists.');
        return;
      }
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const body = (await res.json()) as { data: ApiEntry };
      setEntry(body.data);
      setFormData({
        ...body.data.data,
        slug: body.data.slug ?? body.data.data.slug ?? '',
        status: body.data.status,
      });
    } catch {
      setLoadError('Could not load this entry. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [slug, id]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.slug) newErrors.slug = 'Slug is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const { status, slug: entrySlug, ...data } = formData;
      const res = await fetch(`/api/content/${encodeURIComponent(slug)}/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, slug: entrySlug, status }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setSaveMessage({ kind: 'error', text: body.error ?? 'Save failed. Try again.' });
        return;
      }
      const body = (await res.json()) as { data: ApiEntry };
      setEntry(body.data);
      setSaveMessage({ kind: 'success', text: 'Changes saved.' });
    } catch {
      setSaveMessage({ kind: 'error', text: 'Network error. Your changes were not saved.' });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/content/${encodeURIComponent(slug)}/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      router.push(`/content/${slug}`);
    } catch {
      setDeleting(false);
      setDeleteOpen(false);
      setSaveMessage({ kind: 'error', text: 'Could not delete this entry. Try again.' });
    }
  };

  if (loading) return <LoadingState label="Loading entry…" />;
  if (loadError) return <ErrorState message={loadError} onRetry={() => void load()} />;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/content/${slug}`}>
            <Button variant="ghost" size="icon" className="w-8 h-8" aria-label="Back to entries">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">
              Edit {typeName}
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
              Entry ID: {id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)} aria-label="Delete entry">
            <Trash2 className="w-4 h-4 text-[hsl(var(--destructive))]" aria-hidden="true" />
          </Button>
          <Button size="sm" loading={saving} onClick={handleSave}>
            <Save className="w-4 h-4" aria-hidden="true" />
            Save changes
          </Button>
        </div>
      </div>

      {saveMessage && (
        <div
          role={saveMessage.kind === 'error' ? 'alert' : 'status'}
          className={
            saveMessage.kind === 'error'
              ? 'text-sm rounded-md border border-[hsl(var(--destructive)/0.4)] text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.06)] px-3 py-2'
              : 'text-sm rounded-md border border-[hsl(var(--border))] text-[hsl(var(--foreground))] bg-[hsl(var(--muted)/0.3)] px-3 py-2'
          }
        >
          {saveMessage.text}
        </div>
      )}

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {DEFAULT_FIELDS
                .filter((f) => f.key !== 'status')
                .map((field) => (
                  <FormField
                    key={field.key}
                    field={field}
                    value={formData[field.key]}
                    onChange={(v: unknown) => setFormData((prev) => ({ ...prev, [field.key]: v }))}
                    error={errors[field.key]}
                  />
                ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {DEFAULT_FIELDS
                .filter((f) => f.key === 'status')
                .map((field) => (
                  <FormField
                    key={field.key}
                    field={field}
                    value={formData[field.key]}
                    onChange={(v: unknown) => setFormData((prev) => ({ ...prev, [field.key]: v }))}
                    error={errors[field.key]}
                  />
                ))}
              <Button className="w-full" loading={saving} onClick={handleSave}>
                <Save className="w-4 h-4" aria-hidden="true" />
                Update
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Entry Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Type</span>
                <Badge variant="secondary">{typeName}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">ID</span>
                <span className="font-mono text-xs">{id}</span>
              </div>
              {entry && (
                <>
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--muted-foreground))]">Created</span>
                    <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--muted-foreground))]">Last modified</span>
                    <span>{new Date(entry.updatedAt).toLocaleString()}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${typeName.toLowerCase()} entry`}
        description={`"${String(formData.title ?? id)}" will be permanently deleted. This cannot be undone.`}
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
