'use client';

/**
 * @file components/billing/SubscriptionStatus.tsx
 * @description Current subscription status badge and details card.
 *
 * Shows the user's current plan name, status badge, next billing date,
 * and whether attribution removal is currently active.
 */

import * as React from 'react';
import { CheckCircle, XCircle, Clock, PauseCircle, AlertCircle, CreditCard, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SubscriptionStatusType =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'paused'
  | 'none';

export interface SubscriptionStatusProps {
  status: SubscriptionStatusType;
  planName?: string;
  nextBillingDate?: string | null;
  cancelAtPeriodEnd?: boolean;
  attributionRemoved?: boolean;
  billingPortalUrl?: string;
  onCancel?: () => void;
  onReactivate?: () => void;
  loading?: boolean;
}

// ---------------------------------------------------------------------------
// Status configuration
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  SubscriptionStatusType,
  {
    label: string;
    variant: 'success' | 'warning' | 'destructive' | 'secondary' | 'info' | 'default';
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }
> = {
  active: {
    label: 'Active',
    variant: 'success',
    icon: CheckCircle,
    description: 'Your subscription is active and in good standing.',
  },
  trialing: {
    label: 'Trialing',
    variant: 'info',
    icon: Clock,
    description: 'Your free trial is running. Billing starts at trial end.',
  },
  past_due: {
    label: 'Past Due',
    variant: 'warning',
    icon: AlertCircle,
    description: 'Your last payment failed. Update your payment method to avoid interruption.',
  },
  paused: {
    label: 'Paused',
    variant: 'secondary',
    icon: PauseCircle,
    description: 'Your subscription is paused. Attribution removal is temporarily suspended.',
  },
  canceled: {
    label: 'Canceled',
    variant: 'destructive',
    icon: XCircle,
    description: 'Your subscription has been canceled.',
  },
  none: {
    label: 'No Plan',
    variant: 'secondary',
    icon: CreditCard,
    description: 'You are on the free plan. Upgrade to remove attribution and unlock support.',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SubscriptionStatus({
  status,
  planName,
  nextBillingDate,
  cancelAtPeriodEnd = false,
  attributionRemoved = false,
  billingPortalUrl,
  onCancel,
  onReactivate,
  loading = false,
}: SubscriptionStatusProps) {
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;

  const hasActivePlan = status !== 'none';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              {hasActivePlan
                ? planName ?? 'Support Plan'
                : 'Free — no active subscription'}
            </CardDescription>
          </div>
          <Badge variant={config.variant} className="gap-1.5 text-xs py-1 px-2.5">
            <StatusIcon className="w-3 h-3" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status description */}
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {cancelAtPeriodEnd && status === 'active'
            ? `Your plan is set to cancel at the end of the current billing period${nextBillingDate ? ` on ${nextBillingDate}` : ''}.`
            : config.description}
        </p>

        {/* Attribution removal indicator */}
        <div
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg border',
            attributionRemoved
              ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800'
              : 'bg-[hsl(var(--muted)/0.3)] border-[hsl(var(--border))]',
          )}
        >
          {attributionRemoved ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-[hsl(var(--muted-foreground))] flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p
              className={cn(
                'text-sm font-medium',
                attributionRemoved
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-[hsl(var(--foreground))]',
              )}
            >
              Attribution removal{' '}
              {attributionRemoved ? 'active' : 'not active'}
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
              {attributionRemoved
                ? 'The "Powered by Volqan" footer is hidden on your site.'
                : 'The "Powered by Volqan" footer is shown on your site.'}
            </p>
          </div>
        </div>

        {/* Next billing date */}
        {hasActivePlan && nextBillingDate && !cancelAtPeriodEnd && (
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>
              Next billing date:{' '}
              <span className="font-medium text-[hsl(var(--foreground))]">
                {nextBillingDate}
              </span>
            </span>
          </div>
        )}

        {/* Actions */}
        {hasActivePlan && (
          <div className="flex flex-wrap gap-2 pt-1">
            {billingPortalUrl && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a
                  href={billingPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Manage billing
                </a>
              </Button>
            )}

            {cancelAtPeriodEnd && onReactivate ? (
              <Button
                size="sm"
                onClick={onReactivate}
                loading={loading}
              >
                Reactivate subscription
              </Button>
            ) : onCancel ? (
              <Button
                variant="outline"
                size="sm"
                className="text-[hsl(var(--destructive))] border-[hsl(var(--destructive)/0.3)] hover:bg-[hsl(var(--destructive)/0.05)]"
                onClick={onCancel}
                loading={loading}
              >
                Cancel plan
              </Button>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
