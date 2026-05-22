'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField, type FormFieldDefinition } from '@/components/ui/form-field';
import { Badge } from '@/components/ui/badge';

const DEFAULT_FIELDS: FormFieldDefinition[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'slug', label: 'Slug', type: 'text', required: true, description: 'URL-friendly identifier' },
  { key: 'content', label: 'Content', type: 'richtext' },
  { key: 'status', label: 'Status', type: 'select', required: true, options: [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Scheduled', value: 'scheduled' },
  ]},
  { key: 'publishedAt', label: 'Publish Date', type: 'datetime' },
];

export default function NewContentEntryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const typeName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Content';

  const [fields, setFields] = React.useState<FormFieldDefinition[]>(DEFAULT_FIELDS);
  const [formData, setFormData] = React.useState<Record<string, unknown>>({ status: 'draft' });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!slug) return;
    fetch(`/api/content-types`)
      .then((r) => r.ok ? r.json() : [])
      .then((types: { slug: string; fields: FormFieldDefinition[] }[]) => {
        const ct = types.find((t) => t.slug === slug);
        if (ct?.fields?.length) {
          const mapped = (ct.fields as unknown as Record<string, unknown>[]).map((f) => ({
            key: (f.key as string) ?? (f.name as string),
            label: (f.label as string) ?? ((f.name as string)?.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())),
            type: (f.type as FormFieldDefinition['type']) ?? 'text',
            required: (f.required as boolean) ?? false,
            description: (f.description as string) ?? undefined,
            options: (f.options as FormFieldDefinition['options']) ?? undefined,
          } as FormFieldDefinition));
          setFields(mapped);
        }
      })
      .catch(() => {});
  }, [slug]);

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
      const res = await fetch(`/api/content-types/${slug}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: rest, status, slug: entrySlug }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSaveError((body as { error?: string }).error ?? 'Save failed');
        return;
      }
      router.push(`/content/${slug}`);
    } catch {
      setSaveError('Network error — please try again');
    } finally {
      setSaving(false);
    }
  };

  const mainFields = fields.filter((f) => !['status', 'publishedAt', 'featured'].includes(f.key));
  const sideFields = fields.filter((f) => ['status', 'publishedAt', 'featured'].includes(f.key));

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
              New {typeName}
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
              Fill in the fields below to create a new {typeName.toLowerCase()} entry.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button size="sm" loading={saving} onClick={handleSave}>
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>
      </div>

      {saveError && (
        <div className="rounded-md bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.3)] px-4 py-3 text-sm text-[hsl(var(--destructive))]">
          {saveError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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
              <div className="pt-2 border-t border-[hsl(var(--border))]">
                <Button className="w-full" loading={saving} onClick={handleSave}>
                  <Save className="w-4 h-4" />
                  Publish
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Entry Info</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Type</span>
                <Badge variant="secondary">{typeName}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Status</span>
                <Badge variant="default">New</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
