'use client';

/**
 * @file app/content/[slug]/new/page.tsx
 * @description Create a new content entry. The form is built from the content
 * type's real field definitions (GET /api/content/types/[slug]) and saves via
 * POST /api/content/[type], then opens the new entry in the editor.
 */

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField, type FormFieldDefinition, type FieldType as FormFieldType } from '@/components/ui/form-field';
import { Badge } from '@/components/ui/badge';
import { LoadingState, ErrorState, PermissionDeniedState } from '@/components/ui/async-states';

// ---------------------------------------------------------------------------
// Types (shape of GET /api/content/types/[slug])
// ---------------------------------------------------------------------------

interface ApiFieldDefinition {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  default?: unknown;
  options?: Array<{ label: string; value: string }>;
  validation?: { min?: number; max?: number };
}

interface ApiContentType {
  name: string;
  slug: string;
  fields: ApiFieldDefinition[];
  settings: { draftable?: boolean };
}

/** Core FieldType -> form-field renderer type. Media and relation fields take an ID for now. */
const FORM_TYPE: Record<string, FormFieldType> = {
  TEXT: 'text',
  RICHTEXT: 'richtext',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  DATE: 'date',
  DATETIME: 'datetime',
  EMAIL: 'email',
  URL: 'url',
  SLUG: 'text',
  IMAGE: 'text',
  FILE: 'text',
  JSON: 'json',
  RELATION: 'text',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  COLOR: 'color',
  PASSWORD: 'password',
};

const ID_HINT: Record<string, string> = {
  IMAGE: 'Paste a media ID from the Media library.',
  FILE: 'Paste a media ID from the Media library.',
  RELATION: 'Paste the ID of the related entry.',
  SLUG: 'Leave empty to fill it from the title.',
};

function toFormField(f: ApiFieldDefinition): FormFieldDefinition {
  return {
    key: f.name,
    label: f.label || f.name,
    type: FORM_TYPE[f.type] ?? 'text',
    required: f.required,
    description: ID_HINT[f.type],
    options: f.options,
    defaultValue: f.default,
    min: f.validation?.min,
    max: f.validation?.max,
  };
}

/** Drop empty values so optional fields don't fail server-side type checks. */
function toPayload(fields: ApiFieldDefinition[], data: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const f of fields) {
    const v = data[f.name];
    if (v === undefined || v === null || v === '') continue;
    if (typeof v === 'number' && Number.isNaN(v)) continue;
    payload[f.name] = v;
  }
  return payload;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function NewContentEntryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [contentType, setContentType] = React.useState<ApiContentType | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [forbidden, setForbidden] = React.useState(false);
  const [notFoundType, setNotFoundType] = React.useState(false);

  const [formData, setFormData] = React.useState<Record<string, unknown>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const typeName = contentType?.name ?? (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Content');
  const fields = React.useMemo(() => (contentType?.fields ?? []).map(toFormField), [contentType]);

  const load = React.useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setLoadError(null);
    setForbidden(false);
    setNotFoundType(false);
    try {
      const res = await fetch(`/api/content/types/${encodeURIComponent(slug)}`);
      if (res.status === 401 || res.status === 403) {
        setForbidden(true);
        return;
      }
      if (res.status === 404) {
        setNotFoundType(true);
        return;
      }
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const body = (await res.json()) as { data: ApiContentType };
      setContentType(body.data);
      const defaults: Record<string, unknown> = {};
      for (const f of body.data.fields) {
        defaults[f.name] = f.default ?? (f.type === 'BOOLEAN' ? false : '');
      }
      setFormData(defaults);
    } catch {
      setLoadError('Could not load this content type. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      const v = formData[field.key];
      if (field.required && (v === undefined || v === null || v === '')) {
        newErrors[field.key] = `${field.label} is required`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!contentType || !validate()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/content/${encodeURIComponent(slug)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toPayload(contentType.fields, formData)),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
          fields?: Array<{ field: string; message: string }>;
        };
        if (Array.isArray(body.fields) && body.fields.length > 0) {
          const fieldErrors: Record<string, string> = {};
          for (const fe of body.fields) fieldErrors[fe.field] = fe.message;
          setErrors(fieldErrors);
        }
        setSaveError(
          res.status === 403
            ? 'You do not have permission to create entries.'
            : body.error ?? 'Save failed. Try again.',
        );
        return;
      }
      const body = (await res.json()) as { data: { id: string } };
      router.push(`/content/${slug}/${body.data.id}`);
    } catch {
      setSaveError('Network error. Your entry was not saved.');
    } finally {
      setSaving(false);
    }
  };

  if (forbidden) return <PermissionDeniedState />;
  if (notFoundType) return <ErrorState message={`Content type "${slug}" was not found.`} />;
  if (loading) return <LoadingState label="Loading form…" />;
  if (loadError || !contentType) return <ErrorState message={loadError ?? 'Could not load this content type.'} onRetry={() => void load()} />;

  const startsAsDraft = contentType.settings?.draftable === true;

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
              New {typeName}
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
              Fill in the fields below to create a new {typeName.toLowerCase()} entry.
            </p>
          </div>
        </div>
        <Button size="sm" loading={saving} onClick={handleSave}>
          <Save className="w-4 h-4" aria-hidden="true" />
          Save
        </Button>
      </div>

      {saveError && (
        <div role="alert" className="text-sm rounded-md border border-[hsl(var(--destructive)/0.4)] text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.06)] px-3 py-2">
          {saveError}
        </div>
      )}

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main fields */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {fields.length === 0 && (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  This content type has no fields yet.
                </p>
              )}
              {fields.map((field) => (
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

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {startsAsDraft
                  ? 'New entries of this type are saved as drafts.'
                  : 'New entries of this type are published as soon as you save.'}
              </p>
              <Button className="w-full" loading={saving} onClick={handleSave}>
                <Save className="w-4 h-4" aria-hidden="true" />
                Save
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Entry Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Type</span>
                <Badge variant="secondary">{typeName}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Status after save</span>
                <Badge variant={startsAsDraft ? 'default' : 'success'}>{startsAsDraft ? 'Draft' : 'Published'}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
