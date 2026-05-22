/**
 * @file app/content/page.tsx
 * @description Content types list page — fetches live data from the API.
 */

import Link from 'next/link';
import { cookies } from 'next/headers';
import { Plus, FileText, Database, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ContentTypeRow {
  id: string;
  slug: string;
  name: string;
  description?: string;
  fields: Array<unknown>;
  _count?: { entries: number };
}

async function fetchContentTypes(): Promise<ContentTypeRow[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('volqan_session')?.value;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'}/api/content/types`, {
      headers: { Cookie: token ? `volqan_session=${token}` : '' },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data: ContentTypeRow[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function ContentPage() {
  const contentTypes = await fetchContentTypes();
  const totalEntries = contentTypes.reduce((s, t) => s + (t._count?.entries ?? 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Content</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            {contentTypes.length} content types
            {totalEntries > 0 && ` · ${totalEntries.toLocaleString()} total entries`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/content/types">
            <Button variant="outline" size="sm">
              <Database className="w-4 h-4" />
              Manage Types
            </Button>
          </Link>
          <Link href="/content/types/new">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              New Type
            </Button>
          </Link>
        </div>
      </div>

      {contentTypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
            <Database className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
          </div>
          <h2 className="text-lg font-semibold mb-1">No content types yet</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6 max-w-sm">
            Create your first content type to start managing structured content.
          </p>
          <Link href="/content/types/new">
            <Button size="sm">
              <Plus className="w-4 h-4" /> Create Content Type
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {contentTypes.map((type) => (
            <Card key={type.id} className="hover:shadow-md transition-shadow duration-200 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{type.name}</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {type.description ?? `/${type.slug}`}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[10px]">active</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-lg font-bold text-[hsl(var(--foreground))]">
                        {(type._count?.entries ?? 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">entries</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[hsl(var(--foreground))]">
                        {type.fields?.length ?? 0}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">fields</p>
                    </div>
                  </div>
                  <Link href={`/content/${type.slug}`}>
                    <Button variant="ghost" size="sm" className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Browse <ArrowRight className="w-3.5 h-3.5" />
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
