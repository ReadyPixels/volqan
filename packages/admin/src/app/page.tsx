/**
 * @file app/page.tsx
 * @description Admin dashboard — enhanced overview with modular widgets.
 */

import { Activity } from 'lucide-react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentEntries } from '@/components/dashboard/RecentEntries';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { ContentChart } from '@/components/dashboard/ContentChart';
import { StorageUsage } from '@/components/dashboard/StorageUsage';
import { SystemHealth } from '@/components/dashboard/SystemHealth';

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">
            Welcome back, Admin
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Here&apos;s what&apos;s happening with your site today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
          <Activity className="w-3.5 h-3.5" />
          <span>Last updated just now</span>
        </div>
      </div>

      {/* Stat cards with sparklines */}
      <StatsCards />

      {/* Content chart */}
      <ContentChart />

      {/* Main grid: recent content + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent entries (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <RecentEntries />
          <ActivityFeed />
        </div>

        {/* Right sidebar (1 col) */}
        <div className="space-y-6">
          <QuickActions />
          <StorageUsage />
          <SystemHealth />
        </div>
      </div>
    </div>
  );
}
