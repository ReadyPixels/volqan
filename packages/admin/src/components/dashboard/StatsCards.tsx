'use client';

/**
 * @file components/dashboard/StatsCards.tsx
 * @description 4 stat cards with sparkline trends and percentage change.
 */

import * as React from 'react';
import Link from 'next/link';
import { FileText, Image, Puzzle, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Sparkline (pure SVG, no library)
// ---------------------------------------------------------------------------

interface SparklineProps {
  data: number[];
  color: string;
  className?: string;
}

function Sparkline({ data, color, className }: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 28;
  const step = width / (data.length - 1);

  const points = data
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  // Area fill
  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('overflow-visible', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#grad-${color.replace('#', '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last point dot */}
      {(() => {
        const last = data[data.length - 1];
        const x = (data.length - 1) * step;
        const y = height - ((last - min) / range) * height;
        return <circle cx={x} cy={y} r="2" fill={color} />;
      })()}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Stats data
// ---------------------------------------------------------------------------

const STATS = [
  {
    label: 'Content Entries',
    value: 1248,
    display: '1,248',
    change: 12.4,
    trend: [820, 932, 901, 934, 1090, 1130, 1248],
    icon: FileText,
    color: '#3b82f6',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-500',
    href: '/content',
  },
  {
    label: 'Media Files',
    value: 3841,
    display: '3,841',
    change: 5.2,
    trend: [3200, 3350, 3400, 3520, 3680, 3750, 3841],
    icon: Image,
    color: '#8b5cf6',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    iconColor: 'text-violet-500',
    href: '/media',
  },
  {
    label: 'Active Extensions',
    value: 7,
    display: '7',
    change: 16.7,
    trend: [3, 4, 4, 5, 5, 6, 7],
    icon: Puzzle,
    color: '#f59e0b',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    iconColor: 'text-amber-500',
    href: '/extensions',
  },
  {
    label: 'Users',
    value: 24,
    display: '24',
    change: 14.3,
    trend: [14, 16, 17, 18, 20, 22, 24],
    icon: Users,
    color: '#10b981',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconColor: 'text-emerald-500',
    href: '/users',
  },
];

// ---------------------------------------------------------------------------
// StatsCards
// ---------------------------------------------------------------------------

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {STATS.map((stat) => {
        const Icon = stat.icon;
        const positive = stat.change >= 0;

        return (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer group overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                      stat.bg,
                    )}
                  >
                    <Icon className={cn('w-5 h-5', stat.iconColor)} />
                  </div>
                  <div
                    className={cn(
                      'flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full',
                      positive
                        ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30'
                        : 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30',
                    )}
                  >
                    {positive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(stat.change)}%
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">
                    {stat.display}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{stat.label}</p>
                </div>

                {/* Sparkline */}
                <Sparkline data={stat.trend} color={stat.color} className="w-full h-7" />
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
