'use client';

/**
 * @file components/dashboard/SystemHealth.tsx
 * @description System health indicators: database, cache, extensions, API.
 */

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Database,
  Zap,
  Puzzle,
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type HealthStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

interface HealthItem {
  label: string;
  status: HealthStatus;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  latency?: number;
}

// ---------------------------------------------------------------------------
// Mock health data
// ---------------------------------------------------------------------------

const HEALTH_ITEMS: HealthItem[] = [
  { label: 'Database', status: 'healthy', detail: 'PostgreSQL connected', icon: Database, latency: 4 },
  { label: 'Cache', status: 'healthy', detail: 'Redis in-memory cache', icon: Zap, latency: 0.3 },
  { label: 'Extensions', status: 'healthy', detail: '7 active, 0 errors', icon: Puzzle },
  { label: 'API Gateway', status: 'healthy', detail: 'All endpoints nominal', icon: Globe, latency: 42 },
];

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<HealthStatus, {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  dot: string;
  label: string;
}> = {
  healthy: { icon: CheckCircle2, color: 'text-emerald-500', dot: 'bg-emerald-500', label: 'Healthy' },
  degraded: { icon: AlertCircle, color: 'text-amber-500', dot: 'bg-amber-500', label: 'Degraded' },
  down: { icon: XCircle, color: 'text-red-500', dot: 'bg-red-500', label: 'Down' },
  unknown: { icon: Clock, color: 'text-gray-400', dot: 'bg-gray-400', label: 'Unknown' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SystemHealth() {
  const [lastChecked, setLastChecked] = React.useState<string>('just now');
  const [refreshing, setRefreshing] = React.useState(false);

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastChecked('just now');
    }, 1000);
  }

  const allHealthy = HEALTH_ITEMS.every((i) => i.status === 'healthy');

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-full', allHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-red-500')}>
            </div>
            <CardTitle>System Health</CardTitle>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1.5 rounded-md text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] transition-colors disabled:opacity-50"
            title="Refresh health check"
          >
            <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {HEALTH_ITEMS.map((item) => {
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
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {item.detail}
                  {item.latency !== undefined && (
                    <span className="ml-1 text-[hsl(var(--muted-foreground))/0.7]">
                      · {item.latency < 1 ? `${item.latency * 1000 | 0}µs` : `${item.latency}ms`}
                    </span>
                  )}
                </p>
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
      </CardContent>
    </Card>
  );
}
