"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useBillingStatus } from '@/hooks/react-query/subscriptions/use-billing';

export const BillingWidget: React.FC = () => {
  const { data: billingStatus, isLoading: billingLoading } = useBillingStatus();

  return (
    <Card className="backdrop-blur bg-card/80">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Billing</CardTitle>
          <CardDescription>Subscription status</CardDescription>
        </div>
        <Link aria-label="Manage billing" prefetch href="/settings/billing" className="text-muted-foreground hover:text-primary transition">
          <CreditCard className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        {billingLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-56" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm">{billingStatus?.message || '—'}</div>
            <div className="text-xs text-muted-foreground">Can run jobs: {billingStatus?.can_run ? 'Yes' : 'No'}</div>
            <div className="pt-2">
              <Link href="/settings" className="text-xs text-primary underline underline-offset-4">Manage billing</Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
