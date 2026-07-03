import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Set up Volqan',
  robots: { index: false, follow: false },
};

export default function InstallLayout({ children }: { children: React.ReactNode }) {
  return children;
}
