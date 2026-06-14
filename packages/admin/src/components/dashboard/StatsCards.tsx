'use client';

import * as React from 'react';
import Link from 'next/link';
import { FileText, Image, Puzzle, Users, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Sparkline { data: number[]; color: string; }

function SparklineChart({ data, color }: Readonly<Sparkline>) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 72;
  const H = 24;
  const step = W / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${H - ((v - min) / range) * H}`).join(' ');
  const area = `0,${H} ${pts} ${W},${H}`;
  const last = data.at(-1) ?? 0;
  const lx = (data.length - 1) * step;
  const ly = H - ((last - min) / range) * H;
  const gid = `sg-${color.replace('#', '')}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: W, height: H, overflow: 'visible' }} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="2.5" fill={color} />
    </svg>
  );
}

interface DashboardStats { contentEntries: number; mediaFiles: number; users: number; activeExtensions: number; }

const STAT_META = [
  {
    key: 'contentEntries' as const,
    label: 'Content Entries',
    icon: FileText,
    color: '#2563eb',
    bg: '#eff6ff',
    darkBg: 'rgba(37,99,235,0.12)',
    href: '/content',
    trend: +12,
  },
  {
    key: 'mediaFiles' as const,
    label: 'Media Files',
    icon: Image,
    color: '#7c3aed',
    bg: '#f5f3ff',
    darkBg: 'rgba(124,58,237,0.12)',
    href: '/media',
    trend: +5,
  },
  {
    key: 'activeExtensions' as const,
    label: 'Extensions',
    icon: Puzzle,
    color: '#e8820c',
    bg: '#fef3e2',
    darkBg: 'rgba(232,130,12,0.12)',
    href: '/extensions',
    trend: 0,
  },
  {
    key: 'users' as const,
    label: 'Users',
    icon: Users,
    color: '#059669',
    bg: '#ecfdf5',
    darkBg: 'rgba(5,150,105,0.12)',
    href: '/users',
    trend: +3,
  },
] as const;

function TrendBadge({ value }: Readonly<{ value: number }>) {
  if (value === 0) {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'hsl(var(--muted-foreground))' }}>
        <Minus style={{ width: 10, height: 10 }} aria-hidden="true" /> —
      </span>
    );
  }
  const up = value > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span style={{
      display: 'flex', alignItems: 'center', gap: 2,
      fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 500,
      color: up ? 'var(--emerald-vivid)' : 'var(--rose-vivid)',
    }}>
      <Icon style={{ width: 11, height: 11 }} aria-hidden="true" />
      {up ? '+' : ''}{value}%
    </span>
  );
}

export function StatsCards() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json() as Promise<{ data: DashboardStats }>)
      .then(({ data }) => setStats(data))
      .catch(() => null);
  }, []);

  return (
    <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
      {STAT_META.map((meta) => {
        const Icon = meta.icon;
        const value = stats?.[meta.key] ?? 0;
        const sparkData = stats ? [Math.max(0, value - Math.round(value * 0.3)), Math.max(0, value - Math.round(value * 0.15)), value] : [0, 0, 0];

        return (
          <Link
            key={meta.key}
            href={meta.href}
            className="vq-card vq-card--interactive animate-fade-up"
            style={{ textDecoration: 'none' }}
          >
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div
                  className="stat-card__icon-wrap"
                  style={{ background: dark ? meta.darkBg : meta.bg }}
                >
                  <Icon style={{ width: 16, height: 16, color: meta.color }} aria-hidden="true" />
                </div>
                <TrendBadge value={meta.trend} />
              </div>

              <div className="stat-card__value">
                {stats ? value.toLocaleString() : <span className="skeleton" style={{ display: 'inline-block', width: 48, height: 26, borderRadius: 4 }} />}
              </div>
              <div className="stat-card__label">{meta.label}</div>

              <div style={{ marginTop: 14 }}>
                <SparklineChart data={sparkData} color={meta.color} />
              </div>

              <div
                className="stat-card__bg-decor"
                style={{ background: meta.color }}
                aria-hidden="true"
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
