'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { SubscriptionStatus } from '@/components/billing/SubscriptionStatus';
import { PlanCard } from '@/components/billing/PlanCard';
import { InvoiceTable } from '@/components/billing/InvoiceTable';
import { FeeBreakdown } from '@/components/billing/FeeBreakdown';
import type { InvoiceRow } from '@/components/billing/InvoiceTable';
import type { SubscriptionStatusType } from '@/components/billing/SubscriptionStatus';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const PLAN_FEATURES = [
  'Priority email support',
  'Attribution removal',
  'Early access to new features',
  'Direct access to maintainer',
];

function formatUsd(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

function calculateFee(baseCents: number): number {
  return 50 + Math.floor(baseCents * 0.1);
}

interface BillingStatus {
  status: SubscriptionStatusType | 'none';
  plan: string;
  planName?: string | null;
  nextBillingDate?: string | null;
  cancelAtPeriodEnd?: boolean;
  attributionRemoved?: boolean;
  billingPortalUrl?: string | null;
  invoices?: InvoiceRow[];
}

const YEARLY_PRICE_CENTS = 4800;
const MONTHLY_PRICE_CENTS = 500;

export default function BillingPage() {
  const router = useRouter();
  const [status, setStatus] = React.useState<BillingStatus | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/billing/status')
      .then((r) => r.json() as Promise<{ data: BillingStatus }>)
      .then(({ data }) => setStatus(data))
      .catch(() => setError('Failed to load billing information.'))
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = (planId: string) => {
    router.push(`/billing/checkout?plan=${planId}`);
  };

  const [cancelOpen, setCancelOpen] = React.useState(false);

  const handleCancel = () => setCancelOpen(true);

  const confirmCancel = async () => {
    setActionLoading(true);
    try {
      await fetch('/api/billing/cancel', { method: 'POST' });
      const r = await fetch('/api/billing/status');
      const { data } = (await r.json()) as { data: BillingStatus };
      setStatus(data);
    } finally {
      setActionLoading(false);
      setCancelOpen(false);
    }
  };

  const handlePortal = async () => {
    setActionLoading(true);
    try {
      const r = await fetch('/api/billing/portal', { method: 'POST' });
      const { url } = (await r.json()) as { url?: string };
      if (url) window.location.href = url;
    } finally {
      setActionLoading(false);
    }
  };

  const yearlyFee = calculateFee(YEARLY_PRICE_CENTS);
  const monthlyFee = calculateFee(MONTHLY_PRICE_CENTS);
  const hasSubscription = status?.status !== 'none' && status?.status !== undefined;
  const currentPlanId = status?.plan ?? null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">Billing</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Manage your Support Plan subscription, view invoices, and control attribution.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.08)] text-sm text-[hsl(var(--destructive))]">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-sm text-[hsl(var(--muted-foreground))]">Loading billing information...</div>
      )}

      {!loading && status && (
        <>
          <SubscriptionStatus
            status={(status.status === 'none' ? 'none' : status.status) as SubscriptionStatusType}
            planName={status.planName ?? undefined}
            nextBillingDate={status.nextBillingDate ?? undefined}
            cancelAtPeriodEnd={status.cancelAtPeriodEnd}
            attributionRemoved={status.attributionRemoved}
            billingPortalUrl={status.billingPortalUrl ?? undefined}
            onCancel={hasSubscription ? handleCancel : undefined}
            onManage={status.billingPortalUrl ? handlePortal : undefined}
            loading={actionLoading}
          />

          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Support Plans</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                All plans include the same features. Choose yearly to save 17%.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
              <PlanCard
                name="Support Plan - Yearly"
                intervalLabel="/ year"
                price={formatUsd(YEARLY_PRICE_CENTS)}
                serviceFeeLabel={`+ ${formatUsd(yearlyFee)} Service Fee`}
                features={PLAN_FEATURES}
                isCurrentPlan={currentPlanId === 'support-yearly'}
                recommended
                savingsBadge="Save 17% vs monthly"
                onSelect={() => handleUpgrade('support-yearly')}
              />
              <PlanCard
                name="Support Plan - Monthly"
                intervalLabel="/ month"
                price={formatUsd(MONTHLY_PRICE_CENTS)}
                serviceFeeLabel={`+ ${formatUsd(monthlyFee)} Service Fee`}
                features={PLAN_FEATURES}
                isCurrentPlan={currentPlanId === 'support-monthly'}
                onSelect={() => handleUpgrade('support-monthly')}
              />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">Platform Service Fee</h2>
            <div className="max-w-xl">
              <FeeBreakdown planPriceCents={YEARLY_PRICE_CENTS} isPayPal={false} />
            </div>
          </section>

          {status.invoices && status.invoices.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">Invoices</h2>
              <InvoiceTable invoices={status.invoices} />
            </section>
          )}
        </>
      )}

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel subscription"
        description="Your subscription will remain active until the end of the current billing period, then it will not renew."
        confirmLabel="Cancel subscription"
        cancelLabel="Keep plan"
        loading={actionLoading}
        onConfirm={confirmCancel}
      />
    </div>
  );
}
