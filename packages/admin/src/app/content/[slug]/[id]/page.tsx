'use client';

/**
 * @file app/content/[slug]/[id]/page.tsx
 * @description Edit a specific content entry.
 */

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormField, type FormFieldDefinition } from '@/components/ui/form-field';

// Reuse field defs from new page (in a real app, share from a shared module)
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

export default function EditContentEntryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const id = params?.id as string;
  const typeName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Content';

  const [formData, setFormData] = React.useState<Record<string, unknown>>({
    title: `Sample ${typeName} Entry #${id}`,
    slug: `sample-${typeName.toLowerCase()}-entry-${id}`,
    content: 'This is the content body.',
    status: 'published',
    publishedAt: new Date().toISOString().slice(0, 16),
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

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
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    router.push(`/content/${slug}`);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
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

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {DEFAULT_FIELDS
                .filter((f) => !['status', 'publishedAt'].includes(f.key))
                .map((field) => (
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
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {DEFAULT_FIELDS
                .filter((f) => ['status', 'publishedAt'].includes(f.key))
                .map((field) => (
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
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Created</span>
                <span>3 days ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Last modified</span>
                <span>2 hours ago</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
