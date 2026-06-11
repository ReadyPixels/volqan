import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Reset password | Volqan Admin',
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
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
      <body className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        {children}
      </body>
    </html>
  );
}
