'use client';

/**
 * @file app/content/types/page.tsx
 * @description Content type management — visual schema builder overview.
 */

import * as React from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Database, Hash, Type, ToggleLeft, Calendar, Image, List } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FieldDef {
  name: string;
  type: string;
  required: boolean;
}

interface ContentTypeDef {
  id: string;
  slug: string;
  name: string;
  description: string;
  fields: FieldDef[];
  entryCount: number;
}

const FIELD_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  text: Type,
  textarea: Type,
  richtext: Type,
  number: Hash,
  boolean: ToggleLeft,
  datetime: Calendar,
  date: Calendar,
  image: Image,
  select: List,
  multiselect: List,
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ContentTypesPage() {
  const [types, setTypes] = React.useState<ContentTypeDef[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    fetch('/api/content-types')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => setTypes(data as ContentTypeDef[]))
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(slug: string) {
    setTypes((prev) => prev.filter((t) => t.slug !== slug));
  }

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
            <Plus className="w-4 h-4" />
            New Type
          </Button>
        </Link>
      </div>

      {/* States */}
      {loading && (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading content types…</p>
      )}
      {error && (
        <p className="text-sm text-[hsl(var(--destructive))]">Error: {error}</p>
      )}
      {!loading && !error && types.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Database className="w-10 h-10 mx-auto text-[hsl(var(--muted-foreground))] mb-3" />
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">No content types yet</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 mb-4">
              Create your first content type to start organizing your content.
            </p>
            <Link href="/content/types/new">
              <Button size="sm">
                <Plus className="w-4 h-4" />
                New Type
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Content types */}
      {!loading && types.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {types.map((type) => (
            <Card key={type.slug}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                      <Database className="w-4.5 h-4.5 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <CardTitle>{type.name}</CardTitle>
                      <CardDescription className="mt-0.5">{type.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/content/types/${type.slug}/edit`}>
                      <Button variant="ghost" size="icon" className="w-7 h-7">
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-[hsl(var(--destructive))]"
                      onClick={() => handleDelete(type.slug)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))] mb-2">
                    <span>{type.fields.length} fields</span>
                    <span>{type.entryCount} entries</span>
                  </div>
                  {type.fields.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {type.fields.map((field) => {
                        const Icon = FIELD_ICONS[field.type] ?? Type;
                        return (
                          <div
                            key={field.name}
                            className="flex items-center gap-1 px-2 py-1 rounded-md bg-[hsl(var(--muted)/0.6)] text-xs"
                          >
                            <Icon className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                            <span className="font-medium">{field.name}</span>
                            <span className="text-[hsl(var(--muted-foreground))]">{field.type}</span>
                            {field.required && <span className="text-[hsl(var(--destructive))]">*</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-[hsl(var(--border))] flex items-center justify-between">
                  <Link href={`/content/${type.slug}`}>
                    <Button variant="outline" size="sm">
                      Browse Entries
                    </Button>
                  </Link>
                  <Link href={`/content/${type.slug}/new`}>
                    <Button variant="ghost" size="sm">
                      <Plus className="w-3.5 h-3.5" />
                      Add Entry
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
