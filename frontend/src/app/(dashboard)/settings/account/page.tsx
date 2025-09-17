'use client';
import React from 'react';
import EditPersonalAccountName from '@/components/basejump/edit-personal-account-name';
import { createClient } from '@/lib/supabase/client';
import { UsageRing } from '@/components/profile/UsageRing';
import { StatCard } from '@/components/profile/StatCard';
import UsageLogs from '@/components/billing/usage-logs';
import { MiniCalendar, MiniCalendarEvent } from '@/components/profile/calendar/MiniCalendar';
import { getSubscription } from '@/lib/api';

function AccountNameEditor() {
  const [personal, setPersonal] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.rpc('get_personal_account');
        setPersonal(data);
      } finally { setLoading(false); }
    }; load();
  }, []);
  if (loading) return <div className="h-20 rounded-md bg-muted/40 animate-pulse" />;
  return <EditPersonalAccountName account={personal} />;
}

export default function AccountSettingsPage() {
  const [subscription, setSubscription] = React.useState<any>(null);
  const [subLoading, setSubLoading] = React.useState(false);
  const [showUsageLogs, setShowUsageLogs] = React.useState(false);
  const [triggerEvents, setTriggerEvents] = React.useState<MiniCalendarEvent[]>([]);
  const [calendarMonth, setCalendarMonth] = React.useState(new Date());
  const [profileLoading, setProfileLoading] = React.useState(true);
  const [profileError, setProfileError] = React.useState<string | null>(null);
  const [profileData, setProfileData] = React.useState<{
    user_id: string;
    account: any;
    credential_profile_count: number;
  } | null>(null);

  React.useEffect(() => {
    const load = async () => {
      setSubLoading(true);
      try {
        const sub = await getSubscription();
        setSubscription(sub);
      } catch (e) {
        // silent
      } finally { setSubLoading(false); }
    }; load();
  }, []);

  // Fetch profile basics (account + credential count) for snapshot
  React.useEffect(() => {
    const loadProfile = async () => {
      setProfileLoading(true);
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string,string> = { 'Content-Type': 'application/json' };
        if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
        const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:8000/api';
        const res = await fetch(`${backendBase}/user/profile`, { headers });
        if (!res.ok) throw new Error('Failed to load profile');
        const json = await res.json();
        setProfileData({
          user_id: json.user_id,
          account: json.account,
          credential_profile_count: json.credential_profile_count,
        });
      } catch (e: any) {
        setProfileError(e.message || 'Failed to load profile');
      } finally { setProfileLoading(false); }
    };
    loadProfile();
  }, []);

  // Fetch upcoming scheduled trigger runs (aggregate across agents if needed later)
  React.useEffect(() => {
    // Placeholder: if you have a user-wide endpoint for upcoming runs, use it.
    // For now, leave empty; implement call to backend when available.
    // Example structure (keep stable for UI):
    // setTriggerEvents([{ id:'t1', date:new Date().toISOString(), label:'Trigger', color:'bg-emerald-500' }]);
  }, []);

  const currentUsage = subscription?.current_usage ?? subscription?.subscription?.current_usage ?? 0;
  const costLimit = subscription?.cost_limit ?? subscription?.subscription?.cost_limit ?? 0;

  return (
    <div className="py-6 space-y-10">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground">Manage your personal account details, usage and scheduled triggers.</p>
      </header>
      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-sm font-medium tracking-wide text-muted-foreground/80">Profile</h2>
          <AccountNameEditor />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium tracking-wide text-muted-foreground/80">Usage & Billing</h2>
          <p className="text-[11px] text-muted-foreground/70 leading-relaxed">Detailed usage, spend history and billing status now live on the <a href="/overview" className="underline underline-offset-4 text-primary">Overview</a> dashboard widgets. This settings page focuses on editable profile information and upcoming triggers.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium tracking-wide text-muted-foreground/80">Account Snapshot</h2>
          <div className="grid gap-2 text-[11px] text-muted-foreground/80 border rounded-md p-4 bg-muted/30">
            {profileLoading && (
              <div className="h-10 rounded bg-muted/40 animate-pulse" />
            )}
            {!profileLoading && profileError && (
              <div className="text-destructive">{profileError}</div>
            )}
            {!profileLoading && !profileError && profileData && (
              <>
                <div><span className="font-medium text-foreground">Credential Profiles:</span> {profileData.credential_profile_count}</div>
                <div><span className="font-medium text-foreground">User ID:</span> {profileData.user_id}</div>
                <div><span className="font-medium text-foreground">Account ID:</span> {profileData.account?.id || '—'}</div>
                <div className="text-[10px] text-muted-foreground/60 pt-1">Snapshot data is read-only; manage billing & credentials in their respective tabs.</div>
              </>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium tracking-wide text-muted-foreground/80">Scheduled Triggers Calendar</h2>
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-4 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground/80">
                <span>{calendarMonth.toLocaleString('default',{month:'long'})} {calendarMonth.getFullYear()}</span>
                <div className="flex gap-1">
                  <button onClick={()=> setCalendarMonth(m=> new Date(m.getFullYear(), m.getMonth()-1, 1))} className="px-2 py-1 rounded bg-muted/40 hover:bg-muted/60">←</button>
                  <button onClick={()=> setCalendarMonth(m=> new Date(m.getFullYear(), m.getMonth()+1, 1))} className="px-2 py-1 rounded bg-muted/40 hover:bg-muted/60">→</button>
                </div>
              </div>
              <MiniCalendar month={calendarMonth} selected={new Date()} events={triggerEvents} />
              {triggerEvents.length === 0 && (
                <p className="text-[11px] text-muted-foreground/70">No scheduled trigger runs this month.</p>
              )}
            </div>
            <div className="md:col-span-8 space-y-3 text-[11px]">
              <p className="text-muted-foreground/80 leading-snug">Scheduled triggers you create will appear on the calendar. This view will expand to show upcoming run metadata and quick actions.</p>
              {/* Placeholder list for future detailed upcoming runs */}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
