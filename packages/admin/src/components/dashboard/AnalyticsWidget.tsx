'use client';

/**
 * @file components/dashboard/AnalyticsWidget.tsx
 * @description Analytics overview — page views, API requests, active users.
 * Shows deterministic mock data; connects to a real provider via Settings → Analytics.
 */

import * as React from 'react';
import { TrendingUp, TrendingDown, Eye, Zap, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Deterministic mock data (seeded, anchored to May 20 2026)
// ---------------------------------------------------------------------------

function seeded(seed: number, min: number, max: number): number {
  const h = ((seed * 1103515245 + 12345) & 0x7fffffff) % 1000;
  return Math.round(min + (h / 999) * (max - min));
}

function buildDailyData(days: number) {
  const anchor = new Date('2026-05-20T00:00:00');
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(anchor);
    d.setDate(d.getDate() - (days - 1 - i));
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pageViews: seeded(i * 3 + 1, isWeekend ? 800 : 1800, isWeekend ? 1400 : 3200),
      apiRequests: seeded(i * 3 + 2, isWeekend ? 400 : 900, isWeekend ? 700 : 1600),
      activeUsers: seeded(i * 3 + 3, isWeekend ? 30 : 80, isWeekend ? 60 : 160),
    };
  });
}

const DATA = buildDailyData(30);
const PREV_DATA = buildDailyData(30).map((d, i) => ({
  ...d,
  pageViews: seeded(i * 7 + 11, 900, 2400),
  apiRequests: seeded(i * 7 + 12, 400, 1400),
  activeUsers: seeded(i * 7 + 13, 25, 130),
}));

function sum(arr: typeof DATA, key: keyof (typeof DATA)[0]) {
  return arr.reduce((s, d) => s + (d[key] as number), 0);
}

function pctChange(curr: number, prev: number) {
  if (prev === 0) return 0;
  return Math.round(((curr - prev) / prev) * 100 * 10) / 10;
}

const TOTALS = {
  pageViews: sum(DATA, 'pageViews'),
  apiRequests: sum(DATA, 'apiRequests'),
  activeUsers: Math.max(...DATA.map((d) => d.activeUsers)),
};
const PREV_TOTALS = {
  pageViews: sum(PREV_DATA, 'pageViews'),
  apiRequests: sum(PREV_DATA, 'apiRequests'),
  activeUsers: Math.max(...PREV_DATA.map((d) => d.activeUsers)),
};

// ---------------------------------------------------------------------------
// Sparkline
// ---------------------------------------------------------------------------

interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

function Sparkline({ data, color, width = 120, height = 32 }: SparklineProps) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${height - ((v - min) / range) * (height - 2) - 1}`).join(' ');
  const area = `0,${height} ${pts} ${width},${height}`;
  const gradId = `ag-${color.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradId})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Metric tile
// ---------------------------------------------------------------------------

interface MetricTileProps {
  label: string;
  value: string;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgClass: string;
  iconColorClass: string;
  sparkData: number[];
}

function MetricTile({ label, value, change, icon: Icon, color, bgClass, iconColorClass, sparkData }: MetricTileProps) {
  const positive = change >= 0;
  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="flex items-start justify-between">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', bgClass)}>
          <Icon className={cn('w-4 h-4', iconColorClass)} />
        </div>
        <div
          className={cn(
            'flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full',
            positive
              ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30'
              : 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30',
          )}
          aria-label={`${positive ? 'Up' : 'Down'} ${Math.abs(change)}% vs previous 30 days`}
        >
          {positive ? <TrendingUp className="w-3 h-3" aria-hidden="true" /> : <TrendingDown className="w-3 h-3" aria-hidden="true" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div>
        <p className="text-xl font-bold text-[hsl(var(--foreground))] tracking-tight">{value}</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{label}</p>
      </div>
      <Sparkline data={sparkData} color={color} width={120} height={28} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// AnalyticsWidget
// ---------------------------------------------------------------------------

export function AnalyticsWidget() {
  const metrics: MetricTileProps[] = [
    {
      label: 'Page Views',
      value: TOTALS.pageViews.toLocaleString(),
      change: pctChange(TOTALS.pageViews, PREV_TOTALS.pageViews),
      icon: Eye,
      color: '#3b82f6',
      bgClass: 'bg-blue-50 dark:bg-blue-900/20',
      iconColorClass: 'text-blue-500',
      sparkData: DATA.map((d) => d.pageViews),
    },
    {
      label: 'API Requests',
      value: TOTALS.apiRequests.toLocaleString(),
      change: pctChange(TOTALS.apiRequests, PREV_TOTALS.apiRequests),
      icon: Zap,
      color: '#8b5cf6',
      bgClass: 'bg-violet-50 dark:bg-violet-900/20',
      iconColorClass: 'text-violet-500',
      sparkData: DATA.map((d) => d.apiRequests),
    },
    {
      label: 'Peak Active Users',
      value: TOTALS.activeUsers.toLocaleString(),
      change: pctChange(TOTALS.activeUsers, PREV_TOTALS.activeUsers),
      icon: Users,
      color: '#10b981',
      bgClass: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColorClass: 'text-emerald-500',
      sparkData: DATA.map((d) => d.activeUsers),
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Analytics Overview</CardTitle>
            <CardDescription>Traffic and usage — last 30 days vs previous 30 days</CardDescription>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
            Mock data
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {metrics.map((m) => (
            <MetricTile key={m.label} {...m} />
          ))}
        </div>
        <p className="text-[11px] text-[hsl(var(--muted-foreground))] text-center">
          Connect a real analytics provider in{' '}
          <a href="/settings" className="text-[hsl(var(--primary))] hover:underline focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))] rounded">
            Settings → Analytics
          </a>
          {' '}to replace mock data.
        </p>
      </CardContent>
    </Card>
  );
}
