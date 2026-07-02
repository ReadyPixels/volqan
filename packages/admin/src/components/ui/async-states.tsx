'use client';

/**
 * @file components/ui/async-states.tsx
 * @description Shared loading / empty / error state blocks so every admin
 * surface presents async status feedback the same way.
 */

import * as React from 'react';
import { Loader2, AlertCircle, Inbox, SearchX, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LoadingState({ label = 'Loading…', className }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn('flex flex-col items-center justify-center gap-2 py-12 text-[hsl(var(--muted-foreground))]', className)}>
      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorState({
  message = 'Something went wrong.',
  onRetry,
  className,
}: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div role="alert" className={cn('flex flex-col items-center justify-center gap-3 py-12 text-center', className)}>
      <AlertCircle className="w-6 h-6 text-[hsl(var(--destructive))]" aria-hidden="true" />
      <p className="text-sm text-[hsl(var(--foreground))]">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  title = 'Nothing here yet',
  description,
  action,
  filtered = false,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  /** Use when a filter/search produced no results (different icon and tone) */
  filtered?: boolean;
  className?: string;
}) {
  const Icon = filtered ? SearchX : Inbox;
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 py-12 text-center', className)}>
      <Icon className="w-6 h-6 text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
      <p className="text-sm font-medium text-[hsl(var(--foreground))]">{title}</p>
      {description && <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

export function PermissionDeniedState({ className }: { className?: string }) {
  return (
    <div role="alert" className={cn('flex flex-col items-center justify-center gap-2 py-12 text-center', className)}>
      <ShieldAlert className="w-6 h-6 text-[hsl(var(--warning,38_92%_50%))]" aria-hidden="true" />
      <p className="text-sm font-medium text-[hsl(var(--foreground))]">You do not have permission to view this.</p>
      <p className="text-xs text-[hsl(var(--muted-foreground))]">Contact an administrator if you believe this is a mistake.</p>
    </div>
  );
}
