'use client';

/**
 * @file app/extensions/page.tsx
 * @description Installed extensions list with enable/disable, settings, and marketplace link.
 */

import * as React from 'react';
import Link from 'next/link';
import {
  Puzzle, ExternalLink, Settings, Trash2, RefreshCw,
  CheckCircle, XCircle, AlertCircle, ShoppingBag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { buildMarketplaceURL } from '@volqan/core';

// ---------------------------------------------------------------------------
// Deep link URL
// ---------------------------------------------------------------------------

const MARKETPLACE_URL = buildMarketplaceURL('extension');

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

type ExtStatus = 'enabled' | 'disabled' | 'error' | 'updating';

interface Extension {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  status: ExtStatus;
  marketplace?: boolean;
  hasUpdate?: boolean;
  licenseType: 'free' | 'paid';
}

const EXTENSIONS: Extension[] = [
  { id: 'volqan/seo', name: 'Volqan SEO', description: 'Meta tags, sitemaps, structured data, and Open Graph for all content types.', author: 'Volqan', version: '2.3.1', status: 'enabled', marketplace: true, licenseType: 'free' },
  { id: 'volqan/forms', name: 'Form Builder', description: 'Drag-and-drop form builder with email notifications and submission storage.', author: 'Volqan', version: '1.8.0', status: 'enabled', licenseType: 'free' },
  { id: 'acme/analytics', name: 'Analytics Bridge', description: 'Connect Google Analytics 4, Plausible, or Fathom to your Volqan admin.', author: 'Acme Corp', version: '1.2.3', status: 'enabled', marketplace: true, hasUpdate: true, licenseType: 'paid' },
  { id: 'acme/ecommerce', name: 'E-commerce Suite', description: 'Full shopping cart, checkout, and order management for your content.', author: 'Acme Corp', version: '3.0.0', status: 'disabled', marketplace: true, licenseType: 'paid' },
  { id: 'vendor/search', name: 'Full-text Search', description: 'Powerful full-text search powered by Meilisearch or Algolia.', author: 'SearchCo', version: '0.9.5', status: 'error', licenseType: 'free' },
  { id: 'vendor/i18n', name: 'Internationalization', description: 'Multi-language content with translation workflows and locale management.', author: 'I18n Tools', version: '2.1.0', status: 'disabled', marketplace: true, licenseType: 'paid' },
  { id: 'volqan/backup', name: 'Backup & Restore', description: 'Scheduled backups to S3, GCS, or local storage with one-click restore.', author: 'Volqan', version: '1.5.2', status: 'enabled', licenseType: 'free' },
];

const STATUS_CONFIG: Record<ExtStatus, { badge: React.ReactNode; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  enabled: { badge: <Badge variant="success">Enabled</Badge>, icon: CheckCircle, color: 'text-emerald-500' },
  disabled: { badge: <Badge variant="secondary">Disabled</Badge>, icon: XCircle, color: 'text-[hsl(var(--muted-foreground))]' },
  error: { badge: <Badge variant="destructive">Error</Badge>, icon: AlertCircle, color: 'text-[hsl(var(--destructive))]' },
  updating: { badge: <Badge variant="info">Updating</Badge>, icon: RefreshCw, color: 'text-sky-500' },
};

// ---------------------------------------------------------------------------
// Extension card
// ---------------------------------------------------------------------------

function ExtensionCard({ ext, onToggle, onUninstall }: {
  ext: Extension;
  onToggle: (id: string) => void;
  onUninstall: (id: string) => void;
}) {
  const status = STATUS_CONFIG[ext.status];
  const StatusIcon = status.icon;
  const enabled = ext.status === 'enabled';

  return (
    <Card className={cn('transition-opacity', !enabled && ext.status !== 'error' && 'opacity-70 hover:opacity-100')}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
              enabled ? 'bg-[hsl(var(--primary)/0.1)]' : 'bg-[hsl(var(--muted)/0.5)]',
            )}>
              <Puzzle className={cn('w-5 h-5', enabled ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]')} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">{ext.name}</h3>
                {ext.licenseType === 'paid' && (
                  <Badge variant="outline" className="text-[10px]">Pro</Badge>
                )}
                {ext.hasUpdate && (
                  <Badge variant="info" className="text-[10px]">Update available</Badge>
                )}
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 line-clamp-2">{ext.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">by {ext.author}</span>
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">v{ext.version}</span>
                <span className="text-[10px] font-mono text-[hsl(var(--muted-foreground))]">{ext.id}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {status.badge}

            {/* Toggle */}
            <button
              onClick={() => onToggle(ext.id)}
              className={cn(
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200',
                enabled ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--border))]',
              )}
              role="switch"
              aria-checked={enabled}
              aria-label={enabled ? 'Disable extension' : 'Enable extension'}
            >
              <span
                className={cn(
                  'inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200',
                  enabled ? 'translate-x-4' : 'translate-x-0.5',
                )}
              />
            </button>
          </div>
        </div>

        {/* Error message */}
        {ext.status === 'error' && (
          <div className="mt-3 p-2.5 rounded-md bg-[hsl(var(--destructive)/0.08)] border border-[hsl(var(--destructive)/0.2)] text-xs text-[hsl(var(--destructive))]">
            <AlertCircle className="w-3.5 h-3.5 inline mr-1.5" />
            Extension failed to boot. Check the logs for details.
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 pt-3 border-t border-[hsl(var(--border))] flex items-center gap-2">
          {ext.hasUpdate && (
            <Button variant="outline" size="sm" className="text-xs gap-1">
              <RefreshCw className="w-3 h-3" /> Update to latest
            </Button>
          )}
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            <Settings className="w-3 h-3" /> Settings
          </Button>
          {ext.marketplace && (
            <a href={`https://bazarix.link/extensions/${ext.id}`} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                <ExternalLink className="w-3 h-3" /> Marketplace
              </Button>
            </a>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1 text-[hsl(var(--destructive))] ml-auto"
            onClick={() => onUninstall(ext.id)}
          >
            <Trash2 className="w-3 h-3" /> Uninstall
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ExtensionsPage() {
  const [extensions, setExtensions] = React.useState(EXTENSIONS);

  const handleToggle = (id: string) => {
    setExtensions((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: e.status === 'enabled' ? 'disabled' : 'enabled' }
          : e,
      ),
    );
  };

  const handleUninstall = (id: string) => {
    if (!confirm('Uninstall this extension? All extension data will be removed.')) return;
    setExtensions((prev) => prev.filter((e) => e.id !== id));
  };

  const enabled = extensions.filter((e) => e.status === 'enabled').length;
  const withUpdates = extensions.filter((e) => e.hasUpdate).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Extensions</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            {enabled} of {extensions.length} enabled
            {withUpdates > 0 && ` · ${withUpdates} update${withUpdates > 1 ? 's' : ''} available`}
          </p>
        </div>
        <a href={MARKETPLACE_URL} target="_blank" rel="noopener noreferrer">
          <Button size="sm" className="gap-1.5">
            <ShoppingBag className="w-4 h-4" />
            Browse Marketplace
            <ExternalLink className="w-3 h-3" />
          </Button>
        </a>
      </div>

      {/* Update banner */}
      {withUpdates > 0 && (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20">
          <div className="flex items-center gap-2 text-sm text-sky-700 dark:text-sky-400">
            <RefreshCw className="w-4 h-4" />
            <span>{withUpdates} extension{withUpdates > 1 ? 's have' : ' has'} updates available.</span>
          </div>
          <Button size="sm" variant="outline">
            Update all
          </Button>
        </div>
      )}

      {/* Extensions list */}
      <div className="space-y-3">
        {extensions.map((ext) => (
          <ExtensionCard
            key={ext.id}
            ext={ext}
            onToggle={handleToggle}
            onUninstall={handleUninstall}
          />
        ))}
      </div>

      {/* Marketplace CTA */}
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <ShoppingBag className="w-8 h-8 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
          <h3 className="text-sm font-semibold mb-1">Discover more extensions</h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
            Browse hundreds of extensions on the Bazarix marketplace to supercharge your Volqan installation.
          </p>
          <a href={MARKETPLACE_URL} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="gap-1.5">
              Open Bazarix Marketplace
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
