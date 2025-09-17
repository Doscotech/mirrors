"use client";
import React from 'react';
import { GlassPanel } from '../GlassPanel';
import { ContactMethodsCluster, MeetingSlotsSelector, FavoriteToggle } from '../common';

export interface ProfileIdentityCardProps {
  user: {
    id: string;
    name?: string | null;
    role?: string | null;
    avatarUrl?: string | null;
    createdAt?: string | null;
  };
  account?: { id?: string | null; created_at?: string | null } | null;
  credentialProfileCount?: number;
  loading?: boolean;
}

/**
 * ProfileIdentityCard
 * Displays primary user identity, avatar, role, quick actions (contact, meetings, favorite)
 * Future: add overflow menu for editing profile.
 */
export function ProfileIdentityCard({ user, account, credentialProfileCount, loading }: ProfileIdentityCardProps) {
  return (
    <GlassPanel className="space-y-4" aria-label="Profile identity" role="region">
      <div className="flex items-start gap-4">
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/30 to-emerald-500/30 flex items-center justify-center text-sm font-medium text-muted-foreground overflow-hidden">
          {/* Avatar placeholder; real image hookup later */}
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt={user.name || 'User avatar'} className="w-full h-full object-cover" />
          ) : (
            <span>{user.name?.charAt(0) || 'U'}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold leading-tight truncate">{user.name || 'Unnamed User'}</h2>
              <p className="text-[11px] text-muted-foreground mt-1 truncate">{user.role || 'Member'}</p>
            </div>
            <FavoriteToggle />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-muted-foreground/80">
            <div><span className="font-medium text-foreground">User ID:</span> {user.id}</div>
            <div><span className="font-medium text-foreground">Account:</span> {account?.id || '—'}</div>
            <div><span className="font-medium text-foreground">Created:</span> {account?.created_at ? new Date(account.created_at).toLocaleDateString() : '—'}</div>
            <div><span className="font-medium text-foreground">Profiles:</span> {credentialProfileCount ?? '—'}</div>
          </div>
        </div>
      </div>
      <ContactMethodsCluster methods={[]} />
      <MeetingSlotsSelector date={new Date()} slots={[]} onSelect={() => {}} />
    </GlassPanel>
  );
}

export default ProfileIdentityCard;
