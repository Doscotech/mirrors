'use client';

import React from 'react';
import MobileSidebarToggle from '@/components/layout/MobileSidebarToggle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { BackgroundAALChecker } from '@/components/auth/background-aal-checker';
import { useAccounts } from '@/hooks/use-accounts';
import { useAgents } from '@/hooks/react-query/agents/use-agents';
import { useBillingStatus } from '@/hooks/react-query/subscriptions/use-billing';
import { useSubscription } from '@/hooks/react-query/subscriptions/use-subscriptions';
import { useUsageLogs } from '@/hooks/react-query/subscriptions/use-billing';
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

export default function OverviewPage() {
  // Accounts (personal + teams)
  const { data: accountsData, isLoading: accountsLoading } = useAccounts();
  const personalAccount = accountsData?.find((a: any) => a.personal_account);
  const teamAccounts = (accountsData || []).filter((a: any) => !a.personal_account);

  // Usage / Subscription
  const { data: subscriptionData, isLoading: subscriptionLoading } = useSubscription();
  const { data: billingStatus, isLoading: billingLoading } = useBillingStatus();
  const { data: usageLogsData } = useUsageLogs(0, 1000);

  // Agents (for counts)
  const { data: agentsResp, isLoading: agentsLoading } = useAgents({ page: 1, limit: 1, sort_by: 'created_at', sort_order: 'desc' });
  const agentCount = agentsResp?.pagination?.total_items ?? 0;

  // Projects
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects', 'list'],
    queryFn: getProjects,
    staleTime: 5 * 60 * 1000,
  });

  // Derived usage stats
  const usedUsd = (subscriptionData as any)?.current_usage ?? 0;
  const limitUsd = (subscriptionData as any)?.cost_limit ?? 0;
  const usagePct = limitUsd > 0 ? Math.min(100, Math.round((usedUsd / limitUsd) * 100)) : 0;

  // Sparkline data (last 14 days of spend from usage logs)
  const sparkData = useMemo(() => {
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

  const firstTeamSlug = teamAccounts?.[0]?.slug as string | undefined;

  return (
    <BackgroundAALChecker>
    <div className="flex-1 w-full">
      {/* Header with subtle neon/cyberpunk accent */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.35]">
          <div className="absolute -top-20 -right-10 h-64 w-64 rounded-full bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-gradient-to-br from-fuchsia-500/10 via-cyan-500/10 to-transparent blur-3xl" />
        </div>
        <div className="px-4 md:px-6 pt-6 pb-2 relative">
          <div className="absolute top-2 left-2 md:hidden z-10">
            <MobileSidebarToggle />
          </div>
          <h1 className="xera-headline">Overview</h1>
          <p className="xera-subtitle">Quick snapshot of your account, usage, and workspace.</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 px-4 md:px-6 pb-8">
        {/* Account */}
        <Card className="backdrop-blur bg-card/80">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your identity and teams</CardDescription>
          </CardHeader>
          <CardContent>
            {accountsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-4 w-28" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm">Signed in as</div>
                <div className="text-base font-medium">{personalAccount?.name || personalAccount?.slug || '—'}</div>
                <div className="text-sm text-muted-foreground">Teams: {teamAccounts.length}</div>
                <div className="pt-2">
                  <Link href="/settings" className="text-xs text-primary underline underline-offset-4">Manage settings</Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage */}
  <Card className="backdrop-blur bg-card/80">
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>Current period</CardDescription>
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
                <div className="text-xs text-muted-foreground">
                  Plan: {subscriptionData?.plan_name || 'Free'}
                </div>
                <div>
                  <Link href="/model-pricing" className="text-xs text-primary underline underline-offset-4">View model pricing</Link>
                </div>
                {/* Sparkline */}
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

        {/* Billing */}
        <Card className="backdrop-blur bg-card/80">
          <CardHeader>
            <CardTitle>Billing</CardTitle>
            <CardDescription>Subscription status</CardDescription>
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

        {/* Agents */}
        <Card className="backdrop-blur bg-card/80">
          <CardHeader>
            <CardTitle>Agents</CardTitle>
            <CardDescription>Your custom assistants</CardDescription>
          </CardHeader>
          <CardContent>
            {agentsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : agentCount > 0 ? (
              <div className="flex items-baseline gap-3">
                <div className="text-2xl font-semibold">{agentCount}</div>
                <Link href="/agents?tab=my-agents" className="text-xs text-primary underline underline-offset-4">View all</Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">No agents yet.</div>
                <div className="flex gap-2">
                  <Link href="/agents?tab=my-agents">
                    <Button size="sm">Create your first agent</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projects */}
        <Card className="backdrop-blur bg-card/80">
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>Workspaces and threads</CardDescription>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (projects?.length ?? 0) > 0 ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <div className="text-2xl font-semibold">{projects?.length ?? 0}</div>
                  <Link href="/projects" className="text-xs text-primary underline underline-offset-4">Open projects</Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">No projects yet.</div>
                <div className="flex gap-2">
                  <Link href="/projects">
                    <Button size="sm">Create your first project</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teams */}
        <Card className="backdrop-blur bg-card/80">
          <CardHeader>
            <CardTitle>Teams</CardTitle>
            <CardDescription>Collaborators and orgs</CardDescription>
          </CardHeader>
          <CardContent>
            {accountsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-baseline gap-3">
                <div className="text-2xl font-semibold">{teamAccounts.length}</div>
                <Link href={firstTeamSlug ? `/${firstTeamSlug}/settings` : '/settings'} className="text-xs text-primary underline underline-offset-4">Manage team</Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </BackgroundAALChecker>
  );
}

// Minimal inline sparkline component (no extra deps)
function Sparkline({ values, max, height = 40 }: { values: number[]; max: number; height?: number }) {
  const width = 140;
  const n = values.length || 1;
  const step = n > 1 ? width / (n - 1) : width;
  const points = values.map((v, i) => {
    const x = i * step;
    const y = height - (v / (max || 1)) * height; // invert for SVG coordinate
    return `${x},${isFinite(y) ? y : height}`;
  }).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block text-primary">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
