/**
 * @file app/page.tsx
 * @description Admin dashboard — enhanced overview with modular widgets.
 */

import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentEntries } from '@/components/dashboard/RecentEntries';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { ContentChart } from '@/components/dashboard/ContentChart';
import { StorageUsage } from '@/components/dashboard/StorageUsage';
import { SystemHealth } from '@/components/dashboard/SystemHealth';
import { AnalyticsWidget } from '@/components/dashboard/AnalyticsWidget';
import { DashboardGreeting } from '@/components/dashboard/DashboardGreeting';

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <DashboardGreeting />

      {/* Stat cards with sparklines */}
      <StatsCards />

      {/* Content chart */}
      <ContentChart />

      {/* Analytics overview */}
      <AnalyticsWidget />

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
