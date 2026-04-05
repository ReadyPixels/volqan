/**
 * @file components/dashboard/QuickActions.tsx
 * @description Quick action buttons: Create Content, Upload Media, Install Extension, View Site.
 */

import Link from 'next/link';
import { Plus, Upload, Puzzle, Eye, FileText, Settings, LayoutTemplate } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Actions config
// ---------------------------------------------------------------------------

const QUICK_ACTIONS = [
  {
    label: 'New Content',
    description: 'Create a content entry',
    icon: Plus,
    href: '/content',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40',
    border: 'border-blue-100 dark:border-blue-800/40',
  },
  {
    label: 'New Page',
    description: 'Build a visual page',
    icon: LayoutTemplate,
    href: '/pages/new',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 hover:bg-violet-100 dark:bg-violet-900/20 dark:hover:bg-violet-900/40',
    border: 'border-violet-100 dark:border-violet-800/40',
  },
  {
    label: 'Upload Media',
    description: 'Add images, videos, files',
    icon: Upload,
    href: '/media',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40',
    border: 'border-amber-100 dark:border-amber-800/40',
  },
  {
    label: 'Install Extension',
    description: 'Browse the marketplace',
    icon: Puzzle,
    href: '/extensions',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40',
    border: 'border-emerald-100 dark:border-emerald-800/40',
  },
  {
    label: 'Manage Content Types',
    description: 'Define data structures',
    icon: FileText,
    href: '/content/types',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40',
    border: 'border-rose-100 dark:border-rose-800/40',
  },
  {
    label: 'Settings',
    description: 'Configure your instance',
    icon: Settings,
    href: '/settings',
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/30 dark:hover:bg-gray-800/60',
    border: 'border-gray-100 dark:border-gray-700/40',
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks, one click away</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href}>
                <div
                  className={cn(
                    'flex flex-col gap-2 p-3 rounded-xl border transition-all duration-150 cursor-pointer',
                    action.bg,
                    action.border,
                  )}
                >
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', action.color, 'bg-white/60 dark:bg-black/20')}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={cn('text-xs font-semibold leading-tight', action.color)}>
                      {action.label}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 leading-tight">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View site link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 mt-3 py-2 rounded-lg border border-[hsl(var(--border))] text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <Eye className="w-4 h-4" />
          View Live Site
        </a>
      </CardContent>
    </Card>
  );
}
