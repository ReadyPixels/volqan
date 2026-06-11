'use client';

import * as React from 'react';
import Link from 'next/link';
import { FileText, Image, Puzzle, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Sparkline {
  data: number[];
  color: string;
  className?: string;
}

function SparklineChart({ data, color, className }: Readonly<Sparkline>) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 28;
  const step = width / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${height - ((v - min) / range) * height}`).join(' ');
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  const last = data.at(-1) ?? 0;
  const lx = (data.length - 1) * step;
  const ly = height - ((last - min) / range) * height;
  const gradId = `grad-${color.replace('#', '')}`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn('overflow-visible', className)} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradId})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="2" fill={color} />
    </svg>
  );
}

interface DashboardStats {
  contentEntries: number;
  mediaFiles: number;
  users: number;
  activeExtensions: number;
}

const STAT_META = [
  { key: 'contentEntries' as const, label: 'Content Entries', icon: FileText, color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-500', href: '/content' },
  { key: 'mediaFiles'     as const, label: 'Media Files',     icon: Image,    color: '#8b5cf6', bg: 'bg-violet-50 dark:bg-violet-900/20', iconColor: 'text-violet-500', href: '/media' },
  { key: 'activeExtensions' as const, label: 'Active Extensions', icon: Puzzle, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-900/20', iconColor: 'text-amber-500', href: '/extensions' },
  { key: 'users'          as const, label: 'Users',           icon: Users,    color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-500', href: '/users' },
];

export function StatsCards() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);

  React.useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json() as Promise<{ data: DashboardStats }>)
      .then(({ data }) => setStats(data))
      .catch(() => null);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {STAT_META.map((meta) => {
        const Icon = meta.icon;
        const value = stats?.[meta.key] ?? 0;
        return (
          <Link key={meta.label} href={meta.href}>
            <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer group overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', meta.bg)}>
                    <Icon className={cn('w-5 h-5', meta.iconColor)} />
                  </div>
                  <div className="flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30">
                    <TrendingUp className="w-3 h-3" />
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">
                    {value.toLocaleString()}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{meta.label}</p>
                </div>
                <SparklineChart data={[0, value]} color={meta.color} className="w-full h-7" />
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
