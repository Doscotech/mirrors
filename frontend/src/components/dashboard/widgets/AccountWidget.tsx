"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useAccounts } from '@/hooks/use-accounts';

export const AccountWidget: React.FC = () => {
  const { data: accountsData, isLoading: accountsLoading } = useAccounts();
  const personalAccount = accountsData?.find((a: any) => a.personal_account);
  const teamAccounts = (accountsData || []).filter((a: any) => !a.personal_account);

  return (
    <Card className="backdrop-blur bg-card/80">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your identity and teams</CardDescription>
        </div>
        <Link aria-label="Manage account" prefetch href="/settings/account" className="text-muted-foreground hover:text-primary transition">
          <Settings className="h-4 w-4" />
        </Link>
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
  );
};
