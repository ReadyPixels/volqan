'use client';

/**
 * @file app/pages/new/page.tsx
 * @description Create a new page with the visual builder.
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PageBuilder } from '@/components/page-builder/PageBuilder';
import type { Block, Page } from '@/types/page-builder';

// ---------------------------------------------------------------------------
// Empty page template
// ---------------------------------------------------------------------------

const EMPTY_PAGE: Page = {
  id: 'new',
  title: 'Untitled Page',
  slug: 'untitled',
  status: 'draft',
  blocks: [],
  meta: {},
  settings: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ---------------------------------------------------------------------------
// New page editor
// ---------------------------------------------------------------------------

export default function NewPagePage() {
  const router = useRouter();
  const [page, setPage] = React.useState<Page>({
    ...EMPTY_PAGE,
    title: 'Untitled Page',
    slug: 'untitled',
  });
  const [step, setStep] = React.useState<'meta' | 'builder'>('meta');

  function handleMetaSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setPage((p) => ({
      ...p,
      title: (data.get('title') as string) || 'Untitled Page',
      slug: (data.get('slug') as string) || 'untitled',
    }));
    setStep('builder');
  }

  async function handleSave(blocks: Block[], meta: Page['meta']) {
    // In production: POST /api/pages with { ...page, blocks, meta }
    console.log('Saving page:', { ...page, blocks, meta });
    // Simulate save
    await new Promise((r) => setTimeout(r, 600));
    // Redirect to list after save
    router.push('/pages');
  }

  async function handlePublish() {
    // In production: PATCH /api/pages/:id { status: 'published' }
    await new Promise((r) => setTimeout(r, 400));
  }

  // ---------------------------------------------------------------------------
  // Step 1: Page meta form
  // ---------------------------------------------------------------------------

  if (step === 'meta') {
    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <div className="mb-6">
          <Link href="/pages" className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Pages
          </Link>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Create New Page</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Set a title and slug before building your page</p>
        </div>

        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6">
          <form onSubmit={handleMetaSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                Page Title <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                type="text"
                required
                placeholder="About Us"
                defaultValue={page.title === 'Untitled Page' ? '' : page.title}
                onChange={(e) => {
                  const slug = e.target.value
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-');
                  (document.querySelector('[name=slug]') as HTMLInputElement | null)!.value = slug;
                }}
                className="w-full border border-[hsl(var(--border))] rounded-lg px-3.5 py-2.5 text-sm bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="flex-shrink-0 bg-[hsl(var(--muted))] border border-r-0 border-[hsl(var(--border))] px-3 py-2.5 rounded-l-lg text-sm text-[hsl(var(--muted-foreground))]">
                  /
                </span>
                <input
                  name="slug"
                  type="text"
                  required
                  placeholder="about-us"
                  pattern="[a-z0-9-]+"
                  defaultValue={page.slug === 'untitled' ? '' : page.slug}
                  className="flex-1 border border-[hsl(var(--border))] rounded-r-lg px-3.5 py-2.5 text-sm bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                />
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Only lowercase letters, numbers, and hyphens</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                Template
              </label>
              <select
                name="template"
                className="w-full border border-[hsl(var(--border))] rounded-lg px-3.5 py-2.5 text-sm bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              >
                <option value="">Blank page</option>
                <option value="landing">Landing page</option>
                <option value="content">Content page</option>
                <option value="contact">Contact page</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Start Building →
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Step 2: Visual builder
  // ---------------------------------------------------------------------------

  return (
    <div className="-m-6 h-[calc(100vh-56px)] flex flex-col">
      <PageBuilder
        page={page}
        onSave={handleSave}
        onPublish={handlePublish}
        onPreview={() => window.open(`/${page.slug}`, '_blank')}
      />
    </div>
  );
}
