'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormField, type FormFieldDefinition } from '@/components/ui/form-field';

const DEFAULT_FIELDS: FormFieldDefinition[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'slug', label: 'Slug', type: 'text', required: true, description: 'URL-friendly identifier' },
  { key: 'content', label: 'Content', type: 'richtext' },
  { key: 'status', label: 'Status', type: 'select', options: [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Scheduled', value: 'scheduled' },
  ]},
  { key: 'publishedAt', label: 'Publish Date', type: 'datetime' },
];

interface EntryData {
  id: string;
  data: Record<string, unknown>;
  fields: FormFieldDefinition[];
  status: string;
  slug: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditContentEntryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const id = params?.id as string;
  const typeName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Content';

  const [entry, setEntry] = React.useState<EntryData | null>(null);
  const [fields, setFields] = React.useState<FormFieldDefinition[]>(DEFAULT_FIELDS);
  const [formData, setFormData] = React.useState<Record<string, unknown>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!slug || !id) return;
    fetch(`/api/content-types/${slug}/entries/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((e: EntryData | null) => {
        if (!e) return;
        setEntry(e);
        if (e.fields?.length) {
          const mapped = (e.fields as unknown as Record<string, unknown>[]).map((f) => ({
            key: (f.key as string) ?? (f.name as string),
            label: (f.label as string) ?? ((f.name as string)?.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())),
            type: (f.type as FormFieldDefinition['type']) ?? 'text',
            required: (f.required as boolean) ?? false,
            description: (f.description as string) ?? undefined,
            options: (f.options as FormFieldDefinition['options']) ?? undefined,
          } as FormFieldDefinition));
          setFields(mapped);
        }
        setFormData({ ...e.data, status: e.status, slug: e.slug });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, id]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      if (field.required && !formData[field.key]) {
        newErrors[field.key] = `${field.label} is required`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const { status, slug: entrySlug, ...rest } = formData;
      const res = await fetch(`/api/content-types/${slug}/entries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: rest, status, slug: entrySlug }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSaveError((body as { error?: string }).error ?? 'Save failed');
        return;
      }
    } catch {
      setSaveError('Network error — please try again');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    await fetch(`/api/content-types/${slug}/entries/${id}`, { method: 'DELETE' });
    router.push(`/content/${slug}`);
  };

  const mainFields = fields.filter((f) => !['status', 'publishedAt'].includes(f.key));
  const sideFields = fields.filter((f) => ['status', 'publishedAt'].includes(f.key));

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in max-w-4xl">
        <div className="h-8 w-48 rounded bg-[hsl(var(--muted))] animate-pulse" />
        <div className="h-64 rounded-lg bg-[hsl(var(--muted))] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/content/${slug}`}>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <ArrowLeft className="w-4 h-4" />
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
          <Button variant="outline" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 text-[hsl(var(--destructive))]" />
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button size="sm" loading={saving} onClick={handleSave}>
            <Save className="w-4 h-4" />
            Save changes
          </Button>
        </div>
      </div>

      {saveError && (
        <div className="rounded-md bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.3)] px-4 py-3 text-sm text-[hsl(var(--destructive))]">
          {saveError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Content</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {mainFields.map((field) => (
                <FormField
                  key={field.key}
                  field={field}
                  value={formData[field.key]}
                  onChange={(v: any) => setFormData((prev) => ({ ...prev, [field.key]: v }))}
                  error={errors[field.key]}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {sideFields.map((field) => (
                <FormField
                  key={field.key}
                  field={field}
                  value={formData[field.key]}
                  onChange={(v: any) => setFormData((prev) => ({ ...prev, [field.key]: v }))}
                  error={errors[field.key]}
                />
              ))}
              <Button className="w-full" loading={saving} onClick={handleSave}>
                <Save className="w-4 h-4" />
                Update
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Entry Details</CardTitle></CardHeader>
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
                    <span className="text-[hsl(var(--muted-foreground))]">Author</span>
                    <span>{entry.authorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--muted-foreground))]">Created</span>
                    <span className="text-xs">{new Date(entry.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--muted-foreground))]">Updated</span>
                    <span className="text-xs">{new Date(entry.updatedAt).toLocaleDateString()}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
