/**
 * @file components/dashboard/StorageUsage.tsx
 * @description Storage usage indicator with progress bar.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HardDrive, Image, FileText, Video, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const TOTAL_GB = 20;
const USED_GB = 13.6;

const BREAKDOWN = [
  { label: 'Images', gb: 7.2, icon: Image, color: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400' },
  { label: 'Videos', gb: 4.1, icon: Video, color: 'bg-violet-500', textColor: 'text-violet-600 dark:text-violet-400' },
  { label: 'Documents', gb: 1.8, icon: FileText, color: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400' },
  { label: 'Audio', gb: 0.5, icon: Music, color: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400' },
];

function formatGb(gb: number): string {
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  return `${Math.round(gb * 1024)} MB`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StorageUsage() {
  const usedPercent = Math.round((USED_GB / TOTAL_GB) * 100);
  const isWarning = usedPercent >= 80;
  const isCritical = usedPercent >= 90;

  const barColor = isCritical
    ? 'bg-red-500'
    : isWarning
    ? 'bg-amber-500'
    : 'bg-[hsl(var(--primary))]';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <CardTitle>Storage Usage</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main progress */}
        <div>
          <div className="flex items-end justify-between mb-1.5">
            <div>
              <span className="text-2xl font-bold text-[hsl(var(--foreground))]">
                {formatGb(USED_GB)}
              </span>
              <span className="text-sm text-[hsl(var(--muted-foreground))] ml-1">
                / {TOTAL_GB} GB
              </span>
            </div>
            <span
              className={cn(
                'text-sm font-semibold',
                isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-[hsl(var(--muted-foreground))]',
              )}
            >
              {usedPercent}% used
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', barColor)}
              style={{ width: `${usedPercent}%` }}
            />
          </div>

          {isWarning && (
            <p className={cn('text-xs mt-1.5', isCritical ? 'text-red-500' : 'text-amber-500')}>
              {isCritical
                ? 'Critical: storage almost full. Upgrade your plan.'
                : 'Running low on storage. Consider upgrading.'}
            </p>
          )}
        </div>

        {/* Breakdown */}
        <div className="space-y-2.5">
          {BREAKDOWN.map((item) => {
            const Icon = item.icon;
            const pct = Math.round((item.gb / TOTAL_GB) * 100);
            return (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-[hsl(var(--muted))] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium text-[hsl(var(--foreground))]">{item.label}</span>
                    <span className={cn('text-xs font-medium', item.textColor)}>{formatGb(item.gb)}</span>
                  </div>
                  <div className="h-1 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', item.color)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upgrade link */}
        <a
          href="/settings"
          className="block text-center text-xs text-[hsl(var(--primary))] hover:underline"
        >
          Upgrade storage plan →
        </a>
      </CardContent>
    </Card>
  );
}
