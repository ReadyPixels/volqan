'use client';

/**
 * @file components/layout/MobileNav.tsx
 * @description Mobile bottom navigation bar (visible below 768px).
 * 5 tabs: Dashboard, Content, Media, Extensions, More.
 */

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  Image,
  Puzzle,
  MoreHorizontal,
  X,
  Palette,
  Users,
  Settings,
  LayoutTemplate,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------------------

const TABS = [
  { key: 'dashboard', label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { key: 'content', label: 'Content', href: '/content', icon: Layers },
  { key: 'media', label: 'Media', href: '/media', icon: Image },
  { key: 'extensions', label: 'Extensions', href: '/extensions', icon: Puzzle },
];

// ---------------------------------------------------------------------------
// More menu items
// ---------------------------------------------------------------------------

const MORE_ITEMS = [
  { label: 'Pages', href: '/pages', icon: LayoutTemplate },
  { label: 'Themes', href: '/themes', icon: Palette },
  { label: 'Users', href: '/users', icon: Users },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Bazarix Marketplace', href: 'https://bazarix.link', icon: ExternalLink, external: true },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = React.useState(false);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] md:hidden">
        <div className="flex items-stretch">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors',
                  active
                    ? 'text-[hsl(var(--primary))]'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {active && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[hsl(var(--primary))]" />
                  )}
                </div>
                <span className="text-[10px] font-medium leading-none">{tab.label}</span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors',
              moreOpen
                ? 'text-[hsl(var(--primary))]'
                : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
            )}
          >
            {moreOpen ? <X className="w-5 h-5" /> : <MoreHorizontal className="w-5 h-5" />}
            <span className="text-[10px] font-medium leading-none">More</span>
          </button>
        </div>

        {/* Active indicator bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-transparent">
          {TABS.map((tab) => {
            const active = isActive(tab.href);
            if (!active) return null;
            const idx = TABS.indexOf(tab);
            return (
              <div
                key={tab.key}
                className="absolute top-0 h-0.5 bg-[hsl(var(--primary))] transition-all duration-200 rounded-full"
                style={{
                  left: `${(idx / 5) * 100}%`,
                  width: `${(1 / 5) * 100}%`,
                }}
              />
            );
          })}
        </div>
      </nav>

      {/* More overlay */}
      {moreOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 bg-black/20 md:hidden"
            onClick={() => setMoreOpen(false)}
          />
          {/* Sheet */}
          <div className="fixed bottom-16 left-4 right-4 z-40 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-2xl p-2 md:hidden">
            <div className="grid grid-cols-2 gap-1">
              {MORE_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = 'href' in item && typeof item.href === 'string' && isActive(item.href) && !('external' in item);
                return item.external ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors',
                      active
                        ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                        : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]',
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Bottom padding spacer for content (avoid being hidden behind nav) */}
      <div className="h-16 md:hidden" aria-hidden="true" />
    </>
  );
}
