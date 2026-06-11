'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AuditEntry {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: unknown;
  createdAt: string;
  user: { name: string | null; email: string } | null;
}

const AVATAR_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500'];

function avatarColor(email: string): string {
  let hash = 0;
  for (const c of email) hash = (hash * 31 + (c.codePointAt(0) ?? 0)) & 0xffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function initials(name: string | null, email: string): string {
  if (name) return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

export function ActivityFeed() {
  const [items, setItems] = React.useState<AuditEntry[]>([]);

  React.useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json() as Promise<{ data: { recentActivity: AuditEntry[] } }>)
      .then(({ data }) => setItems(data.recentActivity ?? []))
      .catch(() => null);
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>What&apos;s been happening across your site</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <p className="px-6 py-8 text-sm text-[hsl(var(--muted-foreground))]">No recent activity.</p>
        ) : (
          <div className="divide-y divide-[hsl(var(--border))]">
            {items.map((item) => {
              const email = item.user?.email ?? '';
              const color = avatarColor(email || item.id);
              return (
                <div key={item.id} className="flex items-start gap-3 px-6 py-3 hover:bg-[hsl(var(--accent))] transition-colors">
                  <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-0.5', color)}>
                    {email ? initials(item.user?.name ?? null, email) : '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[hsl(var(--foreground))] leading-snug">
                      <span className="font-medium">{item.user?.name ?? item.user?.email ?? 'System'}</span>
                      {' '}
                      <span className="text-[hsl(var(--muted-foreground))]">{item.action}</span>
                      {item.resource && (
                        <span className="text-[hsl(var(--muted-foreground))]"> on {item.resource}</span>
                      )}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
