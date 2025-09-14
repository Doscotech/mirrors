"use client";
import React from 'react';
import GlassPanel from './GlassPanel';

interface ProfileHeroProps {
  userId: string;
  accountId?: string;
  createdAt?: string | null;
  children?: React.ReactNode;
}

export function ProfileHero({ userId, accountId, createdAt, children }: ProfileHeroProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-blue-500/10 to-emerald-500/10 dark:from-indigo-500/20 dark:via-indigo-500/5 dark:to-emerald-500/10 blur-2xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.8),transparent_55%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
      </div>
      <GlassPanel className="p-6 md:p-8 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-xl relative">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500">Your Profile</h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Manage account, usage and settings. This interface gives you real-time insight into consumption and configuration.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] text-muted-foreground/80">
              <div><span className="font-medium text-foreground">User ID:</span> {userId}</div>
              <div><span className="font-medium text-foreground">Account:</span> {accountId || '—'}</div>
              <div><span className="font-medium text-foreground">Created:</span> {createdAt ? new Date(createdAt).toLocaleDateString() : '—'}</div>
            </div>
          </div>
          <div className="flex-shrink-0">
            {children}
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full bg-gradient-to-tr from-indigo-500/20 to-emerald-500/10 blur-3xl opacity-70 pointer-events-none" />
      </GlassPanel>
    </div>
  );
}

export default ProfileHero;
