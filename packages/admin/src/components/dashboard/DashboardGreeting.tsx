'use client';

import * as React from 'react';
import { Activity } from 'lucide-react';

export function DashboardGreeting() {
  const [name, setName] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data: { name?: string } | null) => { if (data?.name) setName(data.name); })
      .catch(() => {});
  }, []);

  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">
          Welcome back, {name ?? 'Admin'}
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
  );
}
