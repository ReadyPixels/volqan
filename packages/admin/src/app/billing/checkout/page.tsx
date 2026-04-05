'use client';

/**
 * @file app/billing/checkout/page.tsx
 * @description Checkout flow — plan selection and fee breakdown before redirecting
 * to Stripe Checkout.
 *
 * Compliance: Fee must be shown before checkout confirmation per Volqan ToS.
 */

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FeeBreakdown } from '@/components/billing/FeeBreakdown';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Constants (mirrors plans.ts — replace with API call in production)
// ---------------------------------------------------------------------------

const YEARLY_PRICE_CENTS = 4800; // $48.00/year — owner configured
const MONTHLY_PRICE_CENTS = Math.round((YEARLY_PRICE_CENTS / 12) * 1.25); // $5.00/month

const PLAN_FEATURES = [
  'Priority email support',
  'Attribution removal',
  'Early access to new features',
  'Direct access to maintainer',
];

const PLANS = {
  'support-yearly': {
    id: 'support-yearly',
    name: 'Support Plan — Yearly',
    intervalLabel: '/ year',
    priceCents: YEARLY_PRICE_CENTS,
    interval: 'yearly' as const,
  },
  'support-monthly': {
    id: 'support-monthly',
    name: 'Support Plan — Monthly',
    intervalLabel: '/ month',
    priceCents: MONTHLY_PRICE_CENTS,
    interval: 'monthly' as const,
  },
};

type PlanId = keyof typeof PLANS;

function formatUsd(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function calculateFee(baseCents: number): number {
  return 50 + Math.floor(baseCents * 0.1);
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialPlan = (searchParams.get('plan') ?? 'support-yearly') as PlanId;
  const [selectedPlan, setSelectedPlan] = React.useState<PlanId>(
    initialPlan in PLANS ? initialPlan : 'support-yearly',
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const plan = PLANS[selectedPlan];
  const fee = calculateFee(plan.priceCents);
  const total = plan.priceCents + fee;

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call your API route: POST /api/billing/checkout
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          successUrl: `${window.location.origin}/billing?checkout=success`,
          cancelUrl: `${window.location.origin}/billing/checkout?plan=${selectedPlan}`,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }

      const data = (await response.json()) as { url?: string };

      if (!data.url) {
        throw new Error('No checkout URL returned from server.');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={() => router.push('/billing')}
          aria-label="Back to billing"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">
            Checkout
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
            Review your plan and fees before proceeding to payment.
          </p>
        </div>
      </div>

      {/* Plan selection */}
      <div>
        <h2 className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-3 uppercase tracking-wide">
          Select a plan
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(PLANS) as [PlanId, (typeof PLANS)[PlanId]][]).map(
            ([id, p]) => (
              <button
                key={id}
                onClick={() => setSelectedPlan(id)}
                className={cn(
                  'text-left p-4 rounded-lg border transition-all',
                  selectedPlan === id
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] ring-1 ring-[hsl(var(--primary)/0.3)]'
                    : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--accent))]',
                )}
                aria-pressed={selectedPlan === id}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold leading-tight">{p.name}</p>
                  {id === 'support-yearly' && (
                    <Badge variant="default" className="text-xs flex-shrink-0">
                      Best value
                    </Badge>
                  )}
                </div>
                <p className="text-lg font-bold">
                  {formatUsd(p.priceCents)}{' '}
                  <span className="text-sm font-normal text-[hsl(var(--muted-foreground))]">
                    {p.intervalLabel}
                  </span>
                </p>
              </button>
            ),
          )}
        </div>
      </div>

      {/* Features list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">What&apos;s included</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {PLAN_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Fee breakdown — required before checkout */}
      <div>
        <h2 className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-3 uppercase tracking-wide">
          Full price breakdown
        </h2>
        <FeeBreakdown planPriceCents={plan.priceCents} />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.05)] px-4 py-3">
          <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>
        </div>
      )}

      {/* CTA */}
      <div className="flex flex-col gap-3 pb-6">
        <Button
          size="lg"
          className="w-full gap-2"
          loading={loading}
          onClick={handleCheckout}
        >
          <CreditCard className="w-4 h-4" />
          Continue to payment — {formatUsd(total)}
          {plan.interval === 'yearly' ? '/yr' : '/mo'}
        </Button>
        <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
          You will be redirected to Stripe&apos;s secure checkout page. Cancel anytime.
        </p>
      </div>

    </div>
  );
}
