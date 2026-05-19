/**
 * @file app/layout.tsx
 * @description Root admin layout with sidebar, topbar, and attribution footer.
 * This is a React Server Component (Next.js 15 App Router).
 */

import type { Metadata } from 'next';
import './globals.css';
import { AdminShell } from '@/components/layout/AdminShell';

export const metadata: Metadata = {
  title: {
    template: '%s | Volqan Admin',
    default: 'Volqan Admin',
  },
  description: 'Volqan Headless CMS Administration Panel',
  robots: { index: false, follow: false },
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
