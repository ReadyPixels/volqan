'use client';

/**
 * @file components/dashboard/SystemHealth.tsx
 * @description System health indicators, backed by /api/dashboard/health:
 * database connectivity, cache backend, and installed extensions.
 */

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Zap, Puzzle, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type HealthStatus = 'healthy' | 'down' | 'unknown';

interface HealthItem {
  label: string;
  status: HealthStatus;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface HealthResponse {
  data?: {
    database: { connected: boolean; latencyMs: number };
    cache: { backend: 'redis' | 'memory'; connected: boolean };
    extensions: { active: number; total: number };
  };
}

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<HealthStatus, {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  label: string;
}> = {
  healthy: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Healthy' },
  down: { icon: XCircle, color: 'text-red-500', label: 'Down' },
  unknown: { icon: Clock, color: 'text-gray-400', label: 'Unknown' },
};

function buildItems(health: HealthResponse['data'] | null): HealthItem[] {
  if (!health) return [];
  return [
    {
      label: 'Database',
      status: health.database.connected ? 'healthy' : 'down',
      detail: health.database.connected
        ? `Connected · ${health.database.latencyMs}ms`
        : 'Unreachable',
      icon: Database,
    },
    {
      label: 'Cache',
      status: health.cache.connected ? 'healthy' : 'down',
      detail: health.cache.backend === 'redis'
        ? (health.cache.connected ? 'Redis connected' : 'Redis unreachable')
        : 'In-process cache (REDIS_URL not set)',
      icon: Zap,
    },
    {
      label: 'Extensions',
      status: 'healthy',
      detail: `${health.extensions.active} active of ${health.extensions.total} installed`,
      icon: Puzzle,
    },
  ];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SystemHealth() {
  const [health, setHealth] = React.useState<HealthResponse['data'] | null>(null);
  const [error, setError] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [lastChecked, setLastChecked] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setRefreshing(true);
    fetch('/api/dashboard/health')
      .then((r) => r.json() as Promise<HealthResponse>)
      .then((res) => {
        if (!res.data) throw new Error('missing data');
        setHealth(res.data);
        setError(false);
        setLastChecked('just now');
      })
      .catch(() => setError(true))
      .finally(() => setRefreshing(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const items = buildItems(health);
  const allHealthy = items.length > 0 && items.every((i) => i.status === 'healthy');
  const loading = health === null && !error;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              loading ? 'bg-gray-400' : allHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-red-500',
            )} />
            <CardTitle>System Health</CardTitle>
          </div>
          <button
            onClick={load}
            disabled={refreshing}
            className="p-1.5 rounded-md text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] transition-colors disabled:opacity-50"
            title="Refresh health check"
          >
            <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Checking system health…</p>
        )}
        {error && !loading && (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Couldn&apos;t load system health.</p>
        )}
        {items.map((item) => {
          const config = STATUS_CONFIG[item.status];
          const StatusIcon = config.icon;
          const ItemIcon = item.icon;

          return (
            <div key={item.label} className="flex items-center gap-3">
              {/* Service icon */}
              <div className="w-8 h-8 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center flex-shrink-0">
                <ItemIcon className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">{item.label}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.detail}</p>
              </div>

              {/* Status */}
              <div className={cn('flex items-center gap-1 text-xs font-medium', config.color)}>
                <StatusIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:block">{config.label}</span>
              </div>
            </div>
          );
        })}

        {/* Overall summary */}
        {items.length > 0 && (
          <div className={cn(
            'mt-4 flex items-center justify-between text-xs px-3 py-2 rounded-lg',
            allHealthy
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
          )}>
            <span className="font-medium">
              {allHealthy ? 'All systems operational' : 'Some systems degraded'}
            </span>
            <span className="opacity-70">Checked {lastChecked}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
