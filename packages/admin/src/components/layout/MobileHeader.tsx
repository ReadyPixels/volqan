'use client';

/**
 * @file components/layout/MobileHeader.tsx
 * @description Mobile top header with hamburger, page title, user avatar, and notification bell.
 */

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';

// ---------------------------------------------------------------------------
// Page title map
// ---------------------------------------------------------------------------

function usePageTitle(): string {
  const pathname = usePathname();

  if (pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/content/types')) return 'Content Types';
  if (pathname.startsWith('/content')) return 'Content';
  if (pathname.startsWith('/media')) return 'Media';
  if (pathname.startsWith('/extensions')) return 'Extensions';
  if (pathname.startsWith('/themes')) return 'Themes';
  if (pathname.startsWith('/users')) return 'Users';
  if (pathname.startsWith('/settings')) return 'Settings';
  if (pathname.startsWith('/pages/new')) return 'New Page';
  if (pathname.startsWith('/pages/')) return 'Edit Page';
  if (pathname.startsWith('/pages')) return 'Pages';
  return 'Volqan Admin';
}

// ---------------------------------------------------------------------------
// MobileHeader
// ---------------------------------------------------------------------------

export function MobileHeader() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [hasUnread, setHasUnread] = React.useState(true);
  const pageTitle = usePageTitle();

  return (
    <>
      {/* Header bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] md:hidden">
        {/* Hamburger */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="p-2 -ml-2 rounded-lg text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] transition-colors"
          aria-label="Toggle navigation menu"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Page title */}
        <h1 className="text-sm font-semibold text-[hsl(var(--foreground))] absolute left-1/2 -translate-x-1/2">
          {pageTitle}
        </h1>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Notification bell */}
          <button
            className="relative p-2 rounded-lg text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] transition-colors"
            aria-label="Notifications"
            onClick={() => setHasUnread(false)}
          >
            <Bell className="w-5 h-5" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {/* User avatar */}
          <button className="w-8 h-8 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-[hsl(var(--primary-foreground))]">
            <User className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Slide-over sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Slide-over sidebar panel */}
      <div
        className={cn(
          'fixed top-0 left-0 bottom-0 z-50 w-72 bg-[hsl(var(--card))] shadow-2xl transition-transform duration-300 ease-in-out md:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar collapsed={false} onToggle={() => setSidebarOpen(false)} />
      </div>
    </>
  );
}
