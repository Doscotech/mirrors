"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAgents } from '@/hooks/react-query/agents/use-agents';

export const AgentsWidget: React.FC = () => {
  const { data: agentsResp, isLoading: agentsLoading } = useAgents({ page: 1, limit: 1, sort_by: 'created_at', sort_order: 'desc' });
  const agentCount = agentsResp?.pagination?.total_items ?? 0;

  return (
    <Card className="backdrop-blur bg-card/80">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Agents</CardTitle>
          <CardDescription>Your custom assistants</CardDescription>
        </div>
        <Link aria-label="Manage agents" prefetch href="/agents?tab=my-agents" className="text-muted-foreground hover:text-primary transition">
          <Settings className="h-4 w-4" />
        </Link>
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
  );
};
