'use client';

/**
 * @file app/pages/new/page.tsx
 * @description Create a new page. Collects title, slug and template, creates
 * the record via POST /api/pages, then opens it in the visual builder at
 * /pages/[id] (which saves and publishes through PATCH /api/pages/[id]).
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

const TEMPLATES = [
  { value: '', label: 'Blank page' },
  { value: 'landing', label: 'Landing page' },
  { value: 'content', label: 'Content page' },
  { value: 'contact', label: 'Contact page' },
];

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-');
}

export default function NewPagePage() {
  const router = useRouter();
  const [title, setTitle] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [template, setTemplate] = React.useState('');
  const [creating, setCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          ...(template ? { settings: { template } } : {}),
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(
          res.status === 403
            ? 'You do not have permission to create pages.'
            : body.error ?? 'Could not create the page. Try again.',
        );
        return;
      }
      const body = (await res.json()) as { data: { id: string } };
      router.push(`/pages/${encodeURIComponent(body.data.id)}`);
    } catch {
      setError('Network error. The page was not created.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <div className="mb-6">
        <Link href="/pages" className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Pages
        </Link>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Create New Page</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Set a title and slug before building your page</p>
      </div>

      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div role="alert" className="text-sm rounded-md border border-[hsl(var(--destructive)/0.4)] text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.06)] px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="page-title" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
              Page Title <span className="text-red-500">*</span>
            </label>
            <input
              id="page-title"
              name="title"
              type="text"
              required
              placeholder="About Us"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(toSlug(e.target.value));
              }}
              className="w-full border border-[hsl(var(--border))] rounded-lg px-3.5 py-2.5 text-sm bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>

          <div>
            <label htmlFor="page-slug" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <span className="flex-shrink-0 bg-[hsl(var(--muted))] border border-r-0 border-[hsl(var(--border))] px-3 py-2.5 rounded-l-lg text-sm text-[hsl(var(--muted-foreground))]">
                /
              </span>
              <input
                id="page-slug"
                name="slug"
                type="text"
                required
                placeholder="about-us"
                pattern="[a-z0-9-]+"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                className="flex-1 border border-[hsl(var(--border))] rounded-r-lg px-3.5 py-2.5 text-sm bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Only lowercase letters, numbers, and hyphens</p>
          </div>

          <div>
            <label htmlFor="page-template" className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
              Template
            </label>
            <select
              id="page-template"
              name="template"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full border border-[hsl(var(--border))] rounded-lg px-3.5 py-2.5 text-sm bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            >
              {TEMPLATES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={creating || !title.trim() || !slug.trim()}
            className="w-full flex items-center justify-center gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {creating && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            {creating ? 'Creating page…' : 'Start Building →'}
          </button>
        </form>
      </div>
    </div>
  );
}
