'use client';

import * as React from 'react';

export function ClientPageContent({ children }: { children: React.ReactNode }) {
  return <div className="p-4 md:p-6">{children}</div>;
}
