'use client';

/**
 * Shared mock subscription state.
 * Replace with a real API call / context provider before v0.1.0-alpha.
 */
export const MOCK_SUBSCRIPTION = {
  status: 'active' as 'active' | 'none' | 'canceled' | 'past_due',
  planId: 'support-yearly',
  planName: 'Support Plan — Yearly',
  planPriceCents: 4800,
  monthlyPriceCents: 500,
  nextBillingDate: 'May 5, 2027',
  cancelAtPeriodEnd: false,
  attributionRemoved: true,
  billingPortalUrl: '',
};
