'use client';

/**
 * @file app/content/types/new/page.tsx
 * @description Create a new content type with visual field builder.
 * Saves via POST /api/content/types and opens the new type's entry list.
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, GripVertical, Save } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Builder-side field types. Each maps 1:1 onto a core FieldType enum value. */
type FieldType = 'text' | 'richtext' | 'slug' | 'number' | 'boolean' | 'date' | 'datetime' | 'select' | 'image' | 'file' | 'url' | 'email' | 'json';

/** Core FieldType values accepted by the API (see @volqan/core FieldType). */
const API_FIELD_TYPE: Record<FieldType, string> = {
  text: 'TEXT',
  richtext: 'RICHTEXT',
  slug: 'SLUG',
  number: 'NUMBER',
  boolean: 'BOOLEAN',
  date: 'DATE',
  datetime: 'DATETIME',
  select: 'SELECT',
  image: 'IMAGE',
  file: 'FILE',
  url: 'URL',
  email: 'EMAIL',
  json: 'JSON',
};

interface FieldBuilder {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  description: string;
}

const FIELD_TYPES: Array<{ value: FieldType; label: string; description: string }> = [
  { value: 'text', label: 'Text', description: 'Short text input' },
  { value: 'richtext', label: 'Rich Text', description: 'WYSIWYG editor' },
  { value: 'slug', label: 'Slug', description: 'URL-safe, auto-filled from title' },
  { value: 'number', label: 'Number', description: 'Numeric value' },
  { value: 'boolean', label: 'Boolean', description: 'True/false toggle' },
  { value: 'date', label: 'Date', description: 'Date picker' },
  { value: 'datetime', label: 'Datetime', description: 'Date + time picker' },
  { value: 'select', label: 'Select', description: 'Single option' },
  { value: 'image', label: 'Image', description: 'Image from media library' },
  { value: 'file', label: 'File', description: 'File from media library' },
  { value: 'url', label: 'URL', description: 'URL input' },
  { value: 'email', label: 'Email', description: 'Email input' },
  { value: 'json', label: 'JSON', description: 'Structured data' },
];

/** Human label derived from a snake_case or camelCase field name, e.g. "publishedAt" -> "Published At". */
function toLabel(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function toApiSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ---------------------------------------------------------------------------
// Field row component
// ---------------------------------------------------------------------------

interface FieldRowProps {
  field: FieldBuilder;
  onChange: (field: FieldBuilder) => void;
  onRemove: () => void;
}

function FieldRow({ field, onChange, onRemove }: FieldRowProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] group">
      <div className="mt-2 text-[hsl(var(--muted-foreground))] cursor-grab">
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="flex-1 grid grid-cols-2 gap-3">
        <div>
          <input
            type="text"
            value={field.name}
            onChange={(e) => onChange({ ...field, name: e.target.value })}
            placeholder="field_name"
            className="w-full h-8 px-2.5 text-sm rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] font-mono"
          />
        </div>
        <div>
          <select
            value={field.type}
            onChange={(e) => onChange({ ...field, type: e.target.value as FieldType })}
            className="w-full h-8 px-2.5 text-sm rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <input
            type="text"
            value={field.description}
            onChange={(e) => onChange({ ...field, description: e.target.value })}
            placeholder="Optional description..."
            className="w-full h-7 px-2.5 text-xs rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] text-[hsl(var(--muted-foreground))]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-1">
        <label className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => onChange({ ...field, required: e.target.checked })}
            className="w-3.5 h-3.5 rounded accent-[hsl(var(--primary))]"
          />
          Required
        </label>
        <button
          onClick={onRemove}
          className="p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function NewContentTypePage() {
  const router = useRouter();

  const [typeName, setTypeName] = React.useState('');
  const [fields, setFields] = React.useState<FieldBuilder[]>([
    { id: '1', name: 'title', type: 'text', required: true, description: '' },
    { id: '2', name: 'slug', type: 'slug', required: false, description: 'URL-friendly identifier, filled from the title when left empty' },
  ]);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<{ name?: string; fields?: string }>({});
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const addField = (type: FieldType = 'text') => {
    setFields((prev) => [
      ...prev,
      { id: Date.now().toString(), name: '', type, required: false, description: '' },
    ]);
  };

  const updateField = (id: string, field: FieldBuilder) => {
    setFields((prev) => prev.map((f) => (f.id === id ? field : f)));
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSave = async () => {
    const newErrors: typeof errors = {};
    if (!typeName.trim()) newErrors.name = 'Type name is required';
    if (fields.length === 0) newErrors.fields = 'At least one field is required';
    const namedFields = fields.filter((f) => f.name.trim());
    if (fields.length > 0 && namedFields.length !== fields.length) {
      newErrors.fields = 'Every field needs a name';
    }
    const names = namedFields.map((f) => f.name.trim());
    if (new Set(names).size !== names.length) {
      newErrors.fields = 'Field names must be unique';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/content/types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: typeName.trim(),
          fields: namedFields.map((f) => ({
            name: f.name.trim(),
            label: toLabel(f.name.trim()),
            type: API_FIELD_TYPE[f.type],
            required: f.required,
          })),
          settings: {},
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setSaveError(
          res.status === 403
            ? 'You do not have permission to create content types.'
            : body.error ?? 'Save failed. Try again.',
        );
        return;
      }
      const body = (await res.json()) as { data: { slug: string } };
      router.push(`/content/${body.data.slug}`);
    } catch {
      setSaveError('Network error. The content type was not created.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/content/types">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">New Content Type</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
              Define the fields for your new content type.
            </p>
          </div>
        </div>
        <Button size="sm" loading={saving} onClick={handleSave}>
          <Save className="w-4 h-4" />
          Create Type
        </Button>
      </div>

      {saveError && (
        <div role="alert" className="text-sm rounded-md border border-[hsl(var(--destructive)/0.4)] text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.06)] px-3 py-2">
          {saveError}
        </div>
      )}

      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle>Type Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Type Name"
            required
            placeholder="e.g. Blog Post, Product, Event"
            value={typeName}
            onChange={(e: any) => setTypeName(e.target.value)}
            error={errors.name}
            hint="The display name of this content type."
          />
          {typeName && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[hsl(var(--muted-foreground))]">API slug:</span>
              <Badge variant="secondary" className="font-mono text-xs">
                {toApiSlug(typeName)}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Field builder */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Fields ({fields.length})</CardTitle>
            {errors.fields && (
              <p className="text-xs text-[hsl(var(--destructive))]">{errors.fields}</p>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {fields.map((field) => (
            <FieldRow
              key={field.id}
              field={field}
              onChange={(updated) => updateField(field.id, updated)}
              onRemove={() => removeField(field.id)}
            />
          ))}

          {/* Add field dropdown */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
            {FIELD_TYPES.slice(0, 8).map((t) => (
              <button
                key={t.value}
                onClick={() => addField(t.value)}
                className="flex flex-col items-start p-2.5 rounded-lg border border-dashed border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.04)] transition-colors text-left group"
              >
                <div className="flex items-center gap-1.5">
                  <Plus className="w-3 h-3 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))]" />
                  <span className="text-xs font-medium">{t.label}</span>
                </div>
                <span className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">{t.description}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
