'use client';

/**
 * @file app/content/[slug]/new/page.tsx
 * @description Create new content entry with dynamic form.
 */

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField, type FormFieldDefinition } from '@/components/ui/form-field';
import { Badge } from '@/components/ui/badge';

// ---------------------------------------------------------------------------
// Mock field definitions per content type
// ---------------------------------------------------------------------------

const FIELD_DEFS: Record<string, FormFieldDefinition[]> = {
  post: [
    { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Enter post title' },
    { key: 'slug', label: 'Slug', type: 'text', required: true, placeholder: 'my-post-slug', description: 'URL-friendly identifier' },
    { key: 'excerpt', label: 'Excerpt', type: 'textarea', placeholder: 'Short description...' },
    { key: 'content', label: 'Content', type: 'richtext', required: true },
    { key: 'status', label: 'Status', type: 'select', required: true, options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Published', value: 'published' },
      { label: 'Scheduled', value: 'scheduled' },
    ]},
    { key: 'publishedAt', label: 'Publish Date', type: 'datetime' },
    { key: 'featured', label: 'Featured post', type: 'boolean', description: 'Show in featured section' },
    { key: 'tags', label: 'Tags', type: 'multiselect', options: [
      { label: 'Technology', value: 'technology' },
      { label: 'Design', value: 'design' },
      { label: 'Business', value: 'business' },
      { label: 'Tutorial', value: 'tutorial' },
    ]},
    { key: 'coverImage', label: 'Cover Image', type: 'image' },
  ],
  page: [
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'slug', label: 'Slug', type: 'text', required: true },
    { key: 'content', label: 'Content', type: 'richtext', required: true },
    { key: 'metaTitle', label: 'Meta Title', type: 'text', placeholder: 'SEO title' },
    { key: 'metaDescription', label: 'Meta Description', type: 'textarea' },
  ],
  product: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'sku', label: 'SKU', type: 'text', required: true },
    { key: 'price', label: 'Price', type: 'number', required: true, min: 0 },
    { key: 'description', label: 'Description', type: 'richtext' },
    { key: 'category', label: 'Category', type: 'select', options: [
      { label: 'Electronics', value: 'electronics' },
      { label: 'Clothing', value: 'clothing' },
      { label: 'Books', value: 'books' },
    ]},
    { key: 'inStock', label: 'In Stock', type: 'boolean' },
    { key: 'image', label: 'Product Image', type: 'image' },
  ],
};

function getFields(slug: string): FormFieldDefinition[] {
  return FIELD_DEFS[slug] ?? [
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'content', label: 'Content', type: 'richtext' },
    { key: 'status', label: 'Status', type: 'select', options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Published', value: 'published' },
    ]},
  ];
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function NewContentEntryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const typeName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Content';

  const fields = getFields(slug);
  const [formData, setFormData] = React.useState<Record<string, unknown>>(() => {
    const defaults: Record<string, unknown> = {};
    for (const f of fields) {
      defaults[f.key] = f.defaultValue ?? '';
    }
    return defaults;
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSaving(false);
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

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main fields */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {fields
                .filter((f) => !['status', 'publishedAt', 'featured'].includes(f.key))
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

        {/* Sidebar fields */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields
                .filter((f) => ['status', 'publishedAt', 'featured'].includes(f.key))
                .map((field) => (
                  <FormField
                    key={field.key}
                    field={field}
                    value={formData[field.key]}
                    onChange={(v: any) => setFormData((prev) => ({ ...prev, [field.key]: v }))}
                    error={errors[field.key]}
                  />
                ))}
              <div className="pt-2 border-t border-[hsl(var(--border))]">
                <Button
                  className="w-full"
                  loading={saving}
                  onClick={handleSave}
                >
                  <Save className="w-4 h-4" />
                  Publish
                </Button>
              </div>
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
                <span className="text-[hsl(var(--muted-foreground))]">Status</span>
                <Badge variant="default">New</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Created by</span>
                <span>Admin</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
