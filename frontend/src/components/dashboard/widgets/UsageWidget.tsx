"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useSubscription } from '@/hooks/react-query/subscriptions/use-subscriptions';
import { useUsageLogs, useBillingStatus } from '@/hooks/react-query/subscriptions/use-billing';

// Lightweight sparkline reused from overview inline implementation
function Sparkline({ values, max, height = 40 }: { values: number[]; max: number; height?: number }) {
  const width = 140;
  const n = values.length || 1;
  const step = n > 1 ? width / (n - 1) : width;
  const points = values.map((v, i) => {
    const x = i * step;
    const y = height - (v / (max || 1)) * height;
    return `${x},${isFinite(y) ? y : height}`;
  }).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block text-primary">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export const UsageWidget: React.FC = () => {
  const { data: subscriptionData, isLoading: subscriptionLoading } = useSubscription();
  const { data: usageLogsData } = useUsageLogs(0, 1000);

  const usedUsd = (subscriptionData as any)?.current_usage ?? 0;
  const limitUsd = (subscriptionData as any)?.cost_limit ?? 0;
  const usagePct = limitUsd > 0 ? Math.min(100, Math.round((usedUsd / limitUsd) * 100)) : 0;

  const sparkData = React.useMemo(() => {
    const days = 14;
    const today = new Date();
    const buckets = Array.from({ length: days }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (days - 1 - i));
      const key = d.toISOString().slice(0, 10);
      return { key, total: 0 };
    });
    const map = new Map(buckets.map(b => [b.key, b]));
    const logs = usageLogsData?.logs || [];
    for (const log of logs) {
      const key = new Date(log.created_at).toISOString().slice(0, 10);
      const bucket = map.get(key);
      if (bucket) {
        const cost = typeof log.estimated_cost === 'number' ? log.estimated_cost : 0;
        bucket.total += cost;
      }
    }
    const values = buckets.map(b => b.total);
    const max = Math.max(0.0001, ...values);
    return { values, max };
  }, [usageLogsData]);

  return (
    <Card className="backdrop-blur bg-card/80">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Usage</CardTitle>
          <CardDescription>Current period</CardDescription>
        </div>
        <Link aria-label="View detailed usage" prefetch href="/settings/billing#usage" className="text-muted-foreground hover:text-primary transition">
          <BarChart3 className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        {subscriptionLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-4 w-44" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <div className="text-lg font-semibold">${usedUsd.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">of {limitUsd > 0 ? `$${limitUsd.toFixed(2)}` : 'unlimited'}</div>
            </div>
            {limitUsd > 0 && (
              <Progress value={usagePct} className="h-2" />
            )}
            <div className="text-xs text-muted-foreground">Plan: {subscriptionData?.plan_name || 'Free'}</div>
            <div>
              <Link href="/model-pricing" className="text-xs text-primary underline underline-offset-4">View model pricing</Link>
            </div>
            {sparkData.values && (
              <div className="mt-3">
                <Sparkline values={sparkData.values} max={sparkData.max} height={40} />
                <div className="text-[11px] text-muted-foreground mt-1">Last 14 days</div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
