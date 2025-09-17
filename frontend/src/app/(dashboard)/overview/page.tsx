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
// New modular widgets
import dynamic from 'next/dynamic';
import { AccountWidget } from '@/components/dashboard/widgets/AccountWidget';
import { UsageWidget } from '@/components/dashboard/widgets/UsageWidget';
import { BillingWidget } from '@/components/dashboard/widgets/BillingWidget';
// Dynamically loaded (lower priority) widgets
const AgentsWidget = dynamic(() => import('@/components/dashboard/widgets/AgentsWidget').then(m => ({ default: m.AgentsWidget })), {
  loading: () => <div className="h-32 rounded-md border bg-muted/20 animate-pulse" />,
  ssr: false,
});
const ProjectsWidget = dynamic(() => import('@/components/dashboard/widgets/ProjectsWidget').then(m => ({ default: m.ProjectsWidget })), {
  loading: () => <div className="h-32 rounded-md border bg-muted/20 animate-pulse" />,
  ssr: false,
});
const TeamsWidget = dynamic(() => import('@/components/dashboard/widgets/TeamsWidget').then(m => ({ default: m.TeamsWidget })), {
  loading: () => <div className="h-32 rounded-md border bg-muted/20 animate-pulse" />,
  ssr: false,
});

// Simple section wrapper for grouped layout semantics & consistent spacing
function SectionGroup({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="px-1">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">{title}</h2>
        {description && <p className="text-[11px] text-muted-foreground/70 mt-0.5">{description}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {children}
      </div>
    </div>
  );
}

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

      {/* Grouped layout: Account & Teams / Resources */}
      <div className="space-y-10 px-4 md:px-6 pb-10">
        <SectionGroup title="Account & Teams" description="Identity, membership and billing context.">
          <AccountWidget />
          <BillingWidget />
          <TeamsWidget />
        </SectionGroup>
        <SectionGroup title="Resources" description="Your usage, agents and projects.">
          <UsageWidget />
          <AgentsWidget />
          <ProjectsWidget />
        </SectionGroup>
      </div>
    </div>
    </BackgroundAALChecker>
  );
}

// Minimal inline sparkline component (no extra deps)
// Legacy Sparkline retained for backward compatibility (now unused after widget extraction)
function Sparkline() { return null; }
