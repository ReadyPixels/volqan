'use client';

/**
 * @file components/billing/InvoiceTable.tsx
 * @description Invoice history table for the billing page.
 *
 * Displays a list of past invoices with amount, service fee breakdown,
 * date, status, and a download link.
 */

import * as React from 'react';
import { Download, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InvoiceStatusType = 'paid' | 'open' | 'void' | 'uncollectible';

export interface InvoiceRow {
  id: string;
  date: string;
  description: string;
  amount: number;
  serviceFee: number;
  total: number;
  currency: string;
  status: InvoiceStatusType;
  downloadUrl?: string;
}

export interface InvoiceTableProps {
  invoices: InvoiceRow[];
  loading?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatUsd(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

const STATUS_BADGE: Record<
  InvoiceStatusType,
  React.ReactNode
> = {
  paid: <Badge variant="success">Paid</Badge>,
  open: <Badge variant="warning">Open</Badge>,
  void: <Badge variant="secondary">Void</Badge>,
  uncollectible: <Badge variant="destructive">Uncollectible</Badge>,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InvoiceTable({ invoices, loading = false }: InvoiceTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoice history</CardTitle>
          <CardDescription>Past payments and receipts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-10 rounded-md bg-[hsl(var(--muted)/0.5)] animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoice history</CardTitle>
          <CardDescription>Past payments and receipts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <Receipt className="w-10 h-10 text-[hsl(var(--muted-foreground)/0.4)]" />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              No invoices yet. Invoices will appear here after your first payment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice history</CardTitle>
        <CardDescription>
          {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} total
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">
                  Date
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">
                  Description
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-[hsl(var(--muted-foreground))]">
                  Plan price
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-[hsl(var(--muted-foreground))]">
                  Service Fee
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-[hsl(var(--muted-foreground))]">
                  Total
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">
                  Status
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-[hsl(var(--muted-foreground))]">
                  Receipt
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--accent))] transition-colors"
                >
                  <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                    {invoice.date}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium">
                      {invoice.description}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm">
                    {formatUsd(invoice.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-sm text-[hsl(var(--muted-foreground))]">
                      {formatUsd(invoice.serviceFee)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-semibold">
                    {formatUsd(invoice.total)}
                  </td>
                  <td className="px-4 py-3">
                    {STATUS_BADGE[invoice.status]}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {invoice.downloadUrl ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7"
                        asChild
                        aria-label="Download receipt"
                      >
                        <a
                          href={invoice.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </Button>
                    ) : (
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
