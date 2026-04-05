'use client';

/**
 * @file app/billing/page.tsx
 * @description Admin billing page — plan management, invoice history, and fee disclosure.
 *
 * Shows:
 * - Current plan + subscription status
 * - Attribution removal indicator
 * - Plan comparison table (upgrade / downgrade)
 * - Invoice history
 * - Platform Service Fee explanation
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { SubscriptionStatus } from '@/components/billing/SubscriptionStatus';
import { PlanCard } from '@/components/billing/PlanCard';
import { InvoiceTable } from '@/components/billing/InvoiceTable';
import { FeeBreakdown } from '@/components/billing/FeeBreakdown';
import type { InvoiceRow } from '@/components/billing/InvoiceTable';
import type { SubscriptionStatusType } from '@/components/billing/SubscriptionStatus';

// ---------------------------------------------------------------------------
// Mock data — replace with real API calls
// ---------------------------------------------------------------------------

// These values would normally come from your backend API:
//   GET /api/billing/subscription
//   GET /api/billing/invoices

const MOCK_SUBSCRIPTION = {
  status: 'active' as SubscriptionStatusType,
  planId: 'support-yearly',
  planName: 'Support Plan — Yearly',
  planPriceCents: 4800,           // $48.00/year — owner-configured
  monthlyPriceCents: 500,         // (4800 / 12) * 1.25 = 500
  nextBillingDate: 'May 5, 2027',
  cancelAtPeriodEnd: false,
  attributionRemoved: true,
  billingPortalUrl: '',
};

const MOCK_INVOICES: InvoiceRow[] = [
  {
    id: 'inv_1',
    date: 'May 5, 2026',
    description: 'Support Plan — Yearly',
    amount: 4800,
    serviceFee: 530,
    total: 5330,
    currency: 'usd',
    status: 'paid',
    downloadUrl: '#',
  },
  {
    id: 'inv_2',
    date: 'May 5, 2025',
    description: 'Support Plan — Yearly',
    amount: 4800,
    serviceFee: 530,
    total: 5330,
    currency: 'usd',
    status: 'paid',
    downloadUrl: '#',
  },
];

const PLAN_FEATURES = [
  'Priority email support',
  'Attribution removal',
  'Early access to new features',
  'Direct access to maintainer',
];

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

export default function BillingPage() {
  const router = useRouter();
  const [actionLoading, setActionLoading] = React.useState(false);

  // In a real implementation, these would come from useQuery / SWR / fetch
  const subscription = MOCK_SUBSCRIPTION;
  const invoices = MOCK_INVOICES;
  const hasSubscription = subscription.status !== 'none';

  const yearlyFee = calculateFee(subscription.planPriceCents);
  const monthlyFee = calculateFee(subscription.monthlyPriceCents);

  const handleUpgrade = (planId: string) => {
    router.push(`/billing/checkout?plan=${planId}`);
  };

  const handleCancel = async () => {
    if (!confirm('Cancel your subscription at the end of the current billing period?')) return;
    setActionLoading(true);
    // TODO: call POST /api/billing/cancel
    await new Promise((r) => setTimeout(r, 800));
    setActionLoading(false);
  };

  const handleReactivate = async () => {
    setActionLoading(true);
    // TODO: call POST /api/billing/reactivate
    await new Promise((r) => setTimeout(r, 800));
    setActionLoading(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">
          Billing
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Manage your Support Plan subscription, view invoices, and control attribution.
        </p>
      </div>

      {/* Current subscription status */}
      <SubscriptionStatus
        status={subscription.status}
        planName={subscription.planName}
        nextBillingDate={subscription.nextBillingDate}
        cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
        attributionRemoved={subscription.attributionRemoved}
        billingPortalUrl={subscription.billingPortalUrl || undefined}
        onCancel={hasSubscription ? handleCancel : undefined}
        onReactivate={
          subscription.cancelAtPeriodEnd ? handleReactivate : undefined
        }
        loading={actionLoading}
      />

      {/* Plan comparison */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
            Support Plans
          </h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
            All plans include the same features. Choose yearly to save 17%.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
          {/* Yearly plan */}
          <PlanCard
            name="Support Plan — Yearly"
            intervalLabel="/ year"
            price={formatUsd(subscription.planPriceCents)}
            serviceFeeLabel={`+ ${formatUsd(yearlyFee)} Service Fee`}
            features={PLAN_FEATURES}
            isCurrentPlan={
              subscription.status === 'active' &&
              subscription.planId === 'support-yearly'
            }
            recommended
            savingsBadge="Save 17% vs monthly"
            onSelect={() => handleUpgrade('support-yearly')}
          />

          {/* Monthly plan */}
          <PlanCard
            name="Support Plan — Monthly"
            intervalLabel="/ month"
            price={formatUsd(subscription.monthlyPriceCents)}
            serviceFeeLabel={`+ ${formatUsd(monthlyFee)} Service Fee`}
            features={PLAN_FEATURES}
            isCurrentPlan={
              subscription.status === 'active' &&
              subscription.planId === 'support-monthly'
            }
            onSelect={() => handleUpgrade('support-monthly')}
          />
        </div>
      </section>

      {/* Fee explanation card */}
      <section>
        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
          Platform Service Fee
        </h2>
        <div className="max-w-xl">
          <FeeBreakdown
            planPriceCents={subscription.planPriceCents}
            isPayPal={false}
          />
        </div>
      </section>

      {/* Invoice history */}
      <section>
        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
          Invoices
        </h2>
        <InvoiceTable invoices={invoices} />
      </section>

    </div>
  );
}
