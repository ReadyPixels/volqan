'use client';

/**
 * @file components/layout/AdminShell.tsx
 * @description Client-side admin shell with sidebar state management.
 * Fully responsive: desktop sidebar + mobile bottom nav.
 */

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ThemeProvider } from './ThemeProvider';
import { MobileNav } from './MobileNav';
import { MobileHeader } from './MobileHeader';
import { AIAssistant } from '../ai/AIAssistant';
import { MOCK_SUBSCRIPTION } from '@/lib/mock-subscription';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  if (pathname === '/login') {
    return (
      <ThemeProvider defaultTheme="system">
        <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
          {children}
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="system">
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
            <div className="p-4 md:p-6">{children}</div>
          </main>

          {/* Attribution footer (desktop only — hidden when attribution removal is active) */}
          {!MOCK_SUBSCRIPTION.attributionRemoved && (
            <div className="hidden md:block">
              <ClientAttributionFooter />
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />

      {/* AI Assistant (floating, all screen sizes) */}
      <AIAssistant />
    </ThemeProvider>
  );
}

/**
 * Client-side wrapper for AttributionFooter.
 */
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
