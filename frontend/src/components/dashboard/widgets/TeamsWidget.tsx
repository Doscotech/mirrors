"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useAccounts } from '@/hooks/use-accounts';

export const TeamsWidget: React.FC = () => {
  const { data: accountsData, isLoading: accountsLoading } = useAccounts();
  const teamAccounts = (accountsData || []).filter((a: any) => !a.personal_account);
  const firstTeamSlug = teamAccounts?.[0]?.slug as string | undefined;

  return (
    <Card className="backdrop-blur bg-card/80">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Teams</CardTitle>
          <CardDescription>Collaborators and orgs</CardDescription>
        </div>
        <Link aria-label="Manage teams" prefetch href={firstTeamSlug ? `/${firstTeamSlug}/settings` : '/settings'} className="text-muted-foreground hover:text-primary transition">
          <Users className="h-4 w-4" />
        </Link>
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
  );
};
