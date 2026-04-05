/**
 * @file components/dashboard/ActivityFeed.tsx
 * @description Recent activity feed from audit log.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Plus, Edit3, Globe, Trash2, Upload, LogIn, Settings, UserPlus } from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock audit log data
// ---------------------------------------------------------------------------

type ActivityAction = 'created' | 'updated' | 'published' | 'deleted' | 'uploaded' | 'login' | 'settings' | 'invited';

interface ActivityItem {
  id: string;
  user: string;
  userInitials: string;
  userColor: string;
  action: ActivityAction;
  target: string;
  targetType: string;
  timestamp: string;
}

const ACTIVITIES: ActivityItem[] = [
  { id: '1', user: 'Alice Martin', userInitials: 'AM', userColor: 'bg-blue-500', action: 'published', target: 'Getting Started Guide', targetType: 'Blog Post', timestamp: '2 minutes ago' },
  { id: '2', user: 'Bob Chen', userInitials: 'BC', userColor: 'bg-violet-500', action: 'created', target: 'AI Features Post', targetType: 'Blog Post', timestamp: '1 hour ago' },
  { id: '3', user: 'Alice Martin', userInitials: 'AM', userColor: 'bg-blue-500', action: 'uploaded', target: 'hero-image.png', targetType: 'Media', timestamp: '3 hours ago' },
  { id: '4', user: 'Charlie Davis', userInitials: 'CD', userColor: 'bg-amber-500', action: 'updated', target: 'Home Page', targetType: 'Page', timestamp: '5 hours ago' },
  { id: '5', user: 'David Kim', userInitials: 'DK', userColor: 'bg-emerald-500', action: 'invited', target: 'evan@example.com', targetType: 'User', timestamp: '1 day ago' },
  { id: '6', user: 'Alice Martin', userInitials: 'AM', userColor: 'bg-blue-500', action: 'settings', target: 'Email configuration', targetType: 'Settings', timestamp: '2 days ago' },
  { id: '7', user: 'Bob Chen', userInitials: 'BC', userColor: 'bg-violet-500', action: 'deleted', target: 'Draft: Old Post', targetType: 'Blog Post', timestamp: '3 days ago' },
  { id: '8', user: 'Charlie Davis', userInitials: 'CD', userColor: 'bg-amber-500', action: 'login', target: 'chrome/macOS', targetType: 'Session', timestamp: '3 days ago' },
];

const ACTION_CONFIG: Record<ActivityAction, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  created: { label: 'created', icon: Plus, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  updated: { label: 'updated', icon: Edit3, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
  published: { label: 'published', icon: Globe, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
  deleted: { label: 'deleted', icon: Trash2, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
  uploaded: { label: 'uploaded', icon: Upload, color: 'text-violet-500 bg-violet-50 dark:bg-violet-900/20' },
  login: { label: 'signed in via', icon: LogIn, color: 'text-gray-500 bg-gray-50 dark:bg-gray-800/30' },
  settings: { label: 'changed', icon: Settings, color: 'text-gray-500 bg-gray-50 dark:bg-gray-800/30' },
  invited: { label: 'invited', icon: UserPlus, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>What&apos;s been happening across your site</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-[hsl(var(--border))]">
          {ACTIVITIES.map((item) => {
            const config = ACTION_CONFIG[item.action];
            const Icon = config.icon;
            return (
              <div key={item.id} className="flex items-start gap-3 px-6 py-3 hover:bg-[hsl(var(--accent))] transition-colors">
                {/* User avatar */}
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-0.5',
                    item.userColor,
                  )}
                >
                  {item.userInitials}
                </div>

                {/* Activity */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[hsl(var(--foreground))] leading-snug">
                    <span className="font-medium">{item.user}</span>
                    {' '}
                    <span className="text-[hsl(var(--muted-foreground))]">{config.label}</span>
                    {' '}
                    <span className="font-medium">{item.target}</span>
                    {item.targetType && (
                      <span className="text-[hsl(var(--muted-foreground))]"> ({item.targetType})</span>
                    )}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{item.timestamp}</p>
                </div>

                {/* Action icon */}
                <div className={cn('w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5', config.color)}>
                  <Icon className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
