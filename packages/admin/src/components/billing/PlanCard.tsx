'use client';

/**
 * @file components/billing/PlanCard.tsx
 * @description Plan selection card displaying name, price, features list, and CTA button.
 */

import * as React from 'react';
import { Check, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlanCardProps {
  /** Plan display name (e.g. "Support Plan — Yearly"). */
  name: string;

  /** Billing interval label (e.g. "/ year" or "/ month"). */
  intervalLabel: string;

  /** Plan price formatted as a string (e.g. "$48.00"). */
  price: string;

  /** Platform Service Fee formatted string (e.g. "+ $5.30 Service Fee"). */
  serviceFeeLabel?: string;

  /** Feature list to display. */
  features: string[];

  /** Whether this plan is currently active for the user. */
  isCurrentPlan?: boolean;

  /** Whether this is the recommended / best-value plan. */
  recommended?: boolean;

  /** CTA button label. */
  ctaLabel?: string;

  /** Whether the CTA button is loading. */
  loading?: boolean;

  /** Whether the CTA button is disabled. */
  disabled?: boolean;

  /** CTA click handler. */
  onSelect?: () => void;

  /** Optional extra badge label (e.g. "Save 17%"). */
  savingsBadge?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PlanCard({
  name,
  intervalLabel,
  price,
  serviceFeeLabel,
  features,
  isCurrentPlan = false,
  recommended = false,
  ctaLabel,
  loading = false,
  disabled = false,
  onSelect,
  savingsBadge,
}: PlanCardProps) {
  const defaultCtaLabel = isCurrentPlan
    ? 'Current plan'
    : ctaLabel ?? 'Get started';

  return (
    <Card
      className={cn(
        'relative flex flex-col transition-shadow duration-200',
        recommended
          ? 'border-[hsl(var(--primary))] shadow-md ring-1 ring-[hsl(var(--primary)/0.3)]'
          : 'hover:shadow-sm',
        isCurrentPlan && 'bg-[hsl(var(--primary)/0.03)]',
      )}
    >
      {/* Recommended badge */}
      {recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge
            variant="default"
            className="gap-1 shadow-sm text-xs px-2.5 py-0.5"
          >
            <Star className="w-3 h-3" />
            Best value
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3 pt-6">
        {/* Plan name */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[hsl(var(--foreground))] leading-tight">
            {name}
          </h3>
          {isCurrentPlan && (
            <Badge variant="success" className="text-xs flex-shrink-0">
              Active
            </Badge>
          )}
        </div>

        {/* Price */}
        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-[hsl(var(--foreground))]">
              {price}
            </span>
            <span className="text-sm text-[hsl(var(--muted-foreground))]">
              {intervalLabel}
            </span>
          </div>

          {/* Savings badge */}
          {savingsBadge && (
            <span className="mt-1 inline-block text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {savingsBadge}
            </span>
          )}

          {/* Service fee disclosure */}
          {serviceFeeLabel && (
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              {serviceFeeLabel}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 gap-5 pt-0">
        {/* Feature list */}
        <ul className="space-y-2 flex-1">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2.5 text-sm text-[hsl(var(--foreground))]"
            >
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          className="w-full"
          variant={isCurrentPlan ? 'outline' : recommended ? 'default' : 'outline'}
          disabled={isCurrentPlan || disabled}
          loading={loading}
          onClick={onSelect}
        >
          {defaultCtaLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
