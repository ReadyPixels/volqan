'use client';

/**
 * @file app/pages/[id]/page.tsx
 * @description Edit an existing page with the visual builder.
 */

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PageBuilder } from '@/components/page-builder/PageBuilder';
import type { Block, Page } from '@/types/page-builder';

// ---------------------------------------------------------------------------
// Mock data (replace with API fetch)
// ---------------------------------------------------------------------------

const MOCK_PAGES: Record<string, Page> = {
  '1': {
    id: '1',
    title: 'Home',
    slug: '/',
    status: 'published',
    blocks: [
      {
        id: 'hero-1',
        type: 'hero',
        label: 'Hero',
        props: {
          title: 'Welcome to Our Amazing Site',
          subtitle: 'Build beautiful pages with the Volqan visual editor',
          ctaText: 'Get Started',
          ctaHref: '#',
        },
        style: {},
        advanced: {},
      },
      {
        id: 'heading-1',
        type: 'heading',
        label: 'Heading',
        props: { text: 'Our Features', level: 'h2', align: 'center' },
        style: { marginTop: '2rem', marginBottom: '0.5rem' },
        advanced: {},
      },
      {
        id: 'grid-1',
        type: 'grid-3col',
        label: '3 Column Grid',
        props: { gap: '1.5rem' },
        style: {},
        advanced: {},
      },
    ],
    meta: { title: 'Home — My Site', description: 'Welcome to our site.' },
    settings: {},
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-20'),
    publishedAt: new Date('2025-01-15'),
  },
  '2': {
    id: '2',
    title: 'About Us',
    slug: '/about',
    status: 'published',
    blocks: [
      {
        id: 'h-about',
        type: 'heading',
        label: 'Heading',
        props: { text: 'About Us', level: 'h1', align: 'center' },
        style: { marginBottom: '1rem' },
        advanced: {},
      },
      {
        id: 'p-about',
        type: 'paragraph',
        label: 'Paragraph',
        props: { text: 'We are a team of passionate developers building the future of headless CMS.', align: 'center' },
        style: {},
        advanced: {},
      },
    ],
    meta: { title: 'About Us', description: 'Learn about our team.' },
    settings: {},
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-20'),
    publishedAt: new Date('2025-01-10'),
  },
};

// ---------------------------------------------------------------------------
// Edit page
// ---------------------------------------------------------------------------

export default function EditPagePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [page, setPage] = React.useState<Page | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  // Fetch page on mount
  React.useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      const found = MOCK_PAGES[params.id];
      if (found) {
        setPage(found);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [params.id]);

  async function handleSave(blocks: Block[], meta: Page['meta']) {
    // In production: PATCH /api/pages/:id
    if (!page) return;
    setPage((p: any) => p ? { ...p, blocks, meta, updatedAt: new Date() } : p);
    await new Promise((r) => setTimeout(r, 600));
  }

  async function handlePublish() {
    // In production: PATCH /api/pages/:id { status: 'published' }
    if (!page) return;
    setPage((p: any) => p ? { ...p, status: 'published', publishedAt: new Date() } : p);
    await new Promise((r) => setTimeout(r, 400));
  }

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Not found
  // ---------------------------------------------------------------------------

  if (notFound || !page) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">Page not found</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
          The page with ID &ldquo;{params.id}&rdquo; does not exist.
        </p>
        <Link href="/pages">
          <button className="inline-flex items-center gap-2 text-sm text-[hsl(var(--primary))] hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back to Pages
          </button>
        </Link>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Visual builder
  // ---------------------------------------------------------------------------

  return (
    <div className="-m-6 h-[calc(100vh-56px)] flex flex-col">
      <PageBuilder
        page={page}
        onSave={handleSave}
        onPublish={handlePublish}
        onPreview={() => window.open(page.slug, '_blank')}
      />
    </div>
  );
}
