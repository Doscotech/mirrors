'use client';
import React from 'react';
import { BillingModal } from '@/components/billing/billing-modal';
import { useSharedSubscription } from '@/contexts/SubscriptionContext';
import { isLocalMode } from '@/lib/config';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Lightweight embedded billing summary for unified settings page.
// Replaces removed personalAccount billing page dynamic import to avoid module-not-found errors.
export default function EmbeddedBilling() {
  const { data: subscriptionData, isLoading, error } = useSharedSubscription();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="rounded-lg border bg-background/60 backdrop-blur-sm p-4 space-y-4">
      <BillingModal open={open} onOpenChange={setOpen} showUsageLimitAlert={false} />
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium">Billing Summary</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Current month usage & limits</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/model-pricing">Pricing</Link>
          </Button>
          <Button size="sm" onClick={() => setOpen(true)}>Manage</Button>
        </div>
      </div>
      {isLocalMode() && (
        <div className="text-[11px] bg-muted/40 border border-border/50 rounded-md px-3 py-2">
          Local development mode – billing is disabled.
        </div>
      )}
      {error && !isLoading && (
        <div className="text-[11px] text-destructive bg-destructive/10 border border-destructive/30 rounded px-3 py-2">
          Failed to load subscription: {error.message}
        </div>
      )}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : subscriptionData ? (
        <BillingUsageBar
          current={subscriptionData.current_usage ?? 0}
          limit={subscriptionData.cost_limit ?? 0}
        />
      ) : (
        <p className="text-[11px] text-muted-foreground">No subscription data available.</p>
      )}
      <div className="flex justify-end">
  <Button variant="ghost" size="sm" className="h-6 text-[11px] px-2" asChild>
          <Link href="/settings/usage-logs">Usage logs</Link>
        </Button>
      </div>
    </div>
  );
}

function BillingUsageBar({ current, limit }: { current: number; limit: number; }) {
  const pct = limit > 0 ? Math.min(100, (current / limit) * 100) : 0;
  const displayCurrent = current.toFixed(2);
  const displayLimit = limit ? limit.toFixed(2) : '0.00';
  const color = pct < 70 ? 'bg-emerald-500' : pct < 90 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>Agent spend</span>
        <span className="tabular-nums">${displayCurrent} / ${displayLimit}</span>
      </div>
      <div className="h-2 rounded bg-muted overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: pct + '%' }}
          aria-label="Billing usage"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={limit || 0}
          aria-valuenow={current}
        />
      </div>
    </div>
  );
}
