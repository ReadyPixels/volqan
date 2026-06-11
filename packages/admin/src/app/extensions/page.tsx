'use client';

import * as React from 'react';
import {
  Puzzle, ExternalLink, Settings, Trash2, RefreshCw,
  CheckCircle, XCircle, AlertCircle, ShoppingBag,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const MARKETPLACE_URL = `https://bazarix.link/extensions?source=volqan`;

type ExtStatus = 'enabled' | 'disabled' | 'error' | 'updating';

interface Extension {
  id: string;
  extensionId: string;
  name: string;
  version: string;
  enabled: boolean;
  settings: Record<string, unknown>;
}

const STATUS_CONFIG: Record<ExtStatus, { badge: React.ReactNode; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  enabled:  { badge: <Badge variant="success">Enabled</Badge>,   icon: CheckCircle, color: 'text-emerald-500' },
  disabled: { badge: <Badge variant="secondary">Disabled</Badge>, icon: XCircle,     color: 'text-[hsl(var(--muted-foreground))]' },
  error:    { badge: <Badge variant="destructive">Error</Badge>,  icon: AlertCircle, color: 'text-[hsl(var(--destructive))]' },
  updating: { badge: <Badge variant="info">Updating</Badge>,     icon: RefreshCw,   color: 'text-sky-500' },
};

function extStatus(ext: Extension): ExtStatus {
  return ext.enabled ? 'enabled' : 'disabled';
}

function ExtensionCard({ ext, onToggle, onUninstall }: Readonly<{
  ext: Extension;
  onToggle: (id: string, enabled: boolean) => void;
  onUninstall: (id: string) => void;
}>) {
  const status = STATUS_CONFIG[extStatus(ext)];

  return (
    <Card className={cn('transition-opacity', !ext.enabled && 'opacity-70 hover:opacity-100')}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
              ext.enabled ? 'bg-[hsl(var(--primary)/0.1)]' : 'bg-[hsl(var(--muted)/0.5)]',
            )}>
              <Puzzle className={cn('w-5 h-5', ext.enabled ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]')} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">{ext.name}</h3>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] font-mono text-[hsl(var(--muted-foreground))]">{ext.extensionId}</span>
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">v{ext.version}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {status.badge}
            <button
              onClick={() => onToggle(ext.id, !ext.enabled)}
              className={cn(
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200',
                ext.enabled ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--border))]',
              )}
              role="switch"
              aria-checked={ext.enabled}
              aria-label={ext.enabled ? 'Disable extension' : 'Enable extension'}
            >
              <span className={cn(
                'inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200',
                ext.enabled ? 'translate-x-4' : 'translate-x-0.5',
              )} />
            </button>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[hsl(var(--border))] flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            <Settings className="w-3 h-3" /> Settings
          </Button>
          <a href={`https://bazarix.link/extensions/${ext.extensionId}`} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              <ExternalLink className="w-3 h-3" /> Marketplace
            </Button>
          </a>
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

export default function ExtensionsPage() {
  const [extensions, setExtensions] = React.useState<Extension[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    fetch('/api/extensions')
      .then((r) => r.json() as Promise<{ data: Extension[] }>)
      .then(({ data }) => setExtensions(data))
      .catch(() => setError('Failed to load extensions.'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleToggle = async (id: string, enabled: boolean) => {
    setExtensions((prev) => prev.map((e) => e.id === id ? { ...e, enabled } : e));
    try {
      await fetch(`/api/extensions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
    } catch {
      load();
    }
  };

  const handleUninstall = async (id: string) => {
    if (!confirm('Uninstall this extension? All extension data will be removed.')) return;
    setExtensions((prev) => prev.filter((e) => e.id !== id));
    await fetch(`/api/extensions/${id}`, { method: 'DELETE' });
  };

  const enabledCount = extensions.filter((e) => e.enabled).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Extensions</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            {loading ? 'Loading...' : `${enabledCount} of ${extensions.length} enabled`}
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

      {error && (
        <div className="p-4 rounded-lg border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.08)] text-sm text-[hsl(var(--destructive))]">
          {error}
        </div>
      )}

      {!loading && extensions.length === 0 && !error && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Puzzle className="w-10 h-10 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
            <h3 className="text-sm font-semibold mb-1">No extensions installed</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
              Browse the Bazarix marketplace to find extensions for your Volqan installation.
            </p>
            <a href={MARKETPLACE_URL} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="gap-1.5">
                Open Bazarix Marketplace
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {extensions.map((ext) => (
          <ExtensionCard key={ext.id} ext={ext} onToggle={handleToggle} onUninstall={handleUninstall} />
        ))}
      </div>

      {extensions.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <ShoppingBag className="w-8 h-8 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
            <h3 className="text-sm font-semibold mb-1">Discover more extensions</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
              Browse the Bazarix marketplace to supercharge your Volqan installation.
            </p>
            <a href={MARKETPLACE_URL} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="gap-1.5">
                Open Bazarix Marketplace
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
