'use client';

/**
 * @file components/billing/FeeBreakdown.tsx
 * @description Platform Service Fee breakdown component.
 *
 * Displays a transparent breakdown of the fee before the user confirms
 * checkout. Required by Volqan Terms of Service — the fee must be visible
 * before any checkout confirmation.
 *
 * Fee formula: $0.50 flat + 10% of plan price (+ $0.50 if PayPal)
 * Label: "Service Fee" for subscription billing
 */

import * as React from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FeeBreakdownProps {
  /** Plan price in cents. */
  planPriceCents: number;

  /** Whether the payment method is PayPal. */
  isPayPal?: boolean;

  /** Show a compact inline variant instead of the full card. */
  compact?: boolean;

  className?: string;
}

// ---------------------------------------------------------------------------
// Fee calculation (mirrors fee-calculator.ts)
// ---------------------------------------------------------------------------

function calculateFee(baseCents: number, isPayPal: boolean) {
  const flatFee = 50; // $0.50
  const variableFee = Math.floor(baseCents * 0.1); // 10%
  const paypalSurcharge = isPayPal ? 50 : 0; // $0.50

  const totalFee = flatFee + variableFee + paypalSurcharge;
  const total = baseCents + totalFee;

  return { flatFee, variableFee, paypalSurcharge, totalFee, total };
}

function formatUsd(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FeeBreakdown({
  planPriceCents,
  isPayPal = false,
  compact = false,
  className,
}: FeeBreakdownProps) {
  const { flatFee, variableFee, paypalSurcharge, totalFee, total } =
    calculateFee(planPriceCents, isPayPal);

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]',
          className,
        )}
      >
        <Info className="w-3.5 h-3.5 flex-shrink-0" />
        + {formatUsd(totalFee)} Service Fee · total{' '}
        <span className="font-medium text-[hsl(var(--foreground))]">
          {formatUsd(total)}
        </span>
      </span>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] p-4 space-y-3',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-[hsl(var(--muted-foreground))] flex-shrink-0" />
        <h4 className="text-sm font-medium text-[hsl(var(--foreground))]">
          Fee breakdown
        </h4>
      </div>

      {/* Line items */}
      <div className="space-y-1.5 text-sm">
        <FeeRow
          label="Plan price"
          amount={formatUsd(planPriceCents)}
          muted={false}
        />
        <div className="border-t border-[hsl(var(--border))] pt-1.5 space-y-1.5">
          <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
            Service Fee
          </p>
          <FeeRow
            label="Flat fee"
            amount={formatUsd(flatFee)}
            description="$0.50 base"
          />
          <FeeRow
            label="Variable fee"
            amount={formatUsd(variableFee)}
            description="10% of plan price"
          />
          {isPayPal && paypalSurcharge > 0 && (
            <FeeRow
              label="PayPal surcharge"
              amount={formatUsd(paypalSurcharge)}
              description="$0.50 for PayPal payments"
            />
          )}
          <FeeRow
            label="Total Service Fee"
            amount={formatUsd(totalFee)}
            bold
          />
        </div>
        <div className="border-t border-[hsl(var(--border))] pt-1.5">
          <FeeRow
            label="Total charged"
            amount={formatUsd(total)}
            bold
            highlight
          />
        </div>
      </div>

      {/* Disclosure */}
      <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
        The Service Fee covers platform infrastructure, payment processing, and
        ongoing maintenance of the Volqan framework. See the{' '}
        <a
          href="https://volqan.link/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-[hsl(var(--foreground))] transition-colors"
        >
          Terms of Service
        </a>{' '}
        for full disclosure.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component
// ---------------------------------------------------------------------------

function FeeRow({
  label,
  amount,
  description,
  bold = false,
  highlight = false,
  muted = true,
}: {
  label: string;
  amount: string;
  description?: string;
  bold?: boolean;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            'text-sm',
            bold ? 'font-semibold' : 'font-normal',
            highlight
              ? 'text-[hsl(var(--foreground))]'
              : muted
                ? 'text-[hsl(var(--muted-foreground))]'
                : 'text-[hsl(var(--foreground))]',
          )}
        >
          {label}
        </span>
        {description && (
          <span className="ml-2 text-xs text-[hsl(var(--muted-foreground))]">
            ({description})
          </span>
        )}
      </div>
      <span
        className={cn(
          'font-mono text-sm flex-shrink-0',
          bold ? 'font-semibold' : 'font-normal',
          highlight
            ? 'text-[hsl(var(--foreground))]'
            : 'text-[hsl(var(--muted-foreground))]',
        )}
      >
        {amount}
      </span>
    </div>
  );
}
