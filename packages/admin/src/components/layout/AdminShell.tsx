/**
 * @file components/layout/AdminShell.tsx
 * @description Admin shell with sidebar state management.
 * Fully responsive: desktop sidebar + mobile bottom nav.
 */

'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ThemeProvider } from './ThemeProvider';
import { LocaleProvider } from './LocaleProvider';
import { MobileNav } from './MobileNav';
import { MobileHeader } from './MobileHeader';
import { AIAssistant } from '../ai/AIAssistant';
import { ClientPageContent } from './ClientPageContent';

/** Routes that render their own standalone page chrome instead of the admin sidebar shell. */
const STANDALONE_ROUTES = ['/login', '/forgot-password', '/reset-password', '/install'];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const pathname = usePathname();

  if (STANDALONE_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return (
      <ThemeProvider defaultTheme="system">
        <LocaleProvider>
          <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
            {children}
          </div>
          <AIAssistant />
        </LocaleProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="system">
      <LocaleProvider>
      <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
        {/* Desktop sidebar (hidden on mobile) */}
        <div className="hidden md:flex">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        </div>

        {/* Main content area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Desktop top bar (hidden on mobile) */}
          <div className="hidden md:block">
            <TopBar />
          </div>

          {/* Mobile header (visible on mobile) */}
          <MobileHeader />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            <ClientPageContent>{children}</ClientPageContent>
          </main>

          {/* Attribution footer (desktop only) */}
          <div className="hidden md:block">
            <ClientAttributionFooter />
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />

      {/* AI Assistant (floating, all screen sizes) */}
      <AIAssistant />
      </LocaleProvider>
    </ThemeProvider>
  );
}

function ClientAttributionFooter() {
  return (
    <footer
      className="attribution-footer"
      aria-label="Powered by Volqan"
      data-testid="attribution-footer"
    >
      <span>
        Powered by{' '}
        <a
          href="https://volqan.link"
          target="_blank"
          rel="noopener noreferrer"
          className="attribution-footer__link"
        >
          Volqan
        </a>
      </span>
    </footer>
  );
}
