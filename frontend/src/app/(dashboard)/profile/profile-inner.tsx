"use client";
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { createClient } from '@/lib/supabase/client';
import { getSubscription } from '@/lib/api';
import UsageLogs from '@/components/billing/usage-logs';
import { StandardHero } from '@/components/layout/StandardHero';
import { GlassPanel } from '@/components/profile/GlassPanel';
import { UsageRing } from '@/components/profile/UsageRing';
import { StatCard } from '@/components/profile/StatCard';
import { ProfileIdentityCard } from '@/components/profile/identity/ProfileIdentityCard';
import { ProjectSummaryCarousel } from '@/components/profile/projects/ProjectSummaryCarousel';
import { MiniCalendar } from '@/components/profile/calendar/MiniCalendar';
import { InboxPanel } from '@/components/profile/inbox/InboxPanel';
import { FilterTimeframeControls } from '@/components/profile/filters/FilterTimeframeControls';
import { useAllThreads } from '@/hooks/react-query/threads/use-thread-queries';

interface ProfileResponse {
  user_id: string;
  account: any;
  subscription: any;
  current_usage: number | null;
  cost_limit: number | null;
  credential_profile_count: number;
}

export default function ProfileInner() {
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [subLoading, setSubLoading] = useState(false);
  const [showUsageLogs, setShowUsageLogs] = useState(false);
  // Filter + thread data state (moved above returns to keep hook order stable)
  const [activeStatus, setActiveStatus] = useState<string>('All');
  const [activeMonth, setActiveMonth] = useState<Date>(new Date());
  const { data: threads = [], isLoading: threadsLoading } = useAllThreads();

  // Helper to robustly format currency-like numbers that may arrive as strings
  const formatDollar = (val: any) => {
    if (val === null || val === undefined) return '—';
    const num = typeof val === 'number' ? val : parseFloat(val);
    if (Number.isNaN(num)) return '—';
    return `$${num.toFixed(2)}`;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string,string> = { 'Content-Type': 'application/json' };
        if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:8000/api';
  const res = await fetch(`${backendBase}/user/profile`, { headers });
        if (!res.ok) throw new Error('Failed to load');
        const json = await res.json();
        setData(json);
  // preferences removed
      } catch (e: any) {
        setError(e.message || 'Failed');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Fetch subscription / usage summary
  useEffect(() => {
    const loadSub = async () => {
      setSubLoading(true);
      try {
        const sub = await getSubscription();
        setSubscriptionData(sub);
      } catch (e) {
        // Silent; profile already shows usage basics
      } finally {
        setSubLoading(false);
      }
    };
    loadSub();
  }, []);

  // Activity-driven progress metric
  // Inputs: recency (updated_at), age, inferred message_count if present in metadata
  // Strategy: score = (recencyWeight * recentnessScore + volumeWeight * volumeScore) then clamp to 0..0.95
  const threadCards = useMemo(() => {
    const colors: any[] = ['yellow','blue','rose','emerald'];
    const now = Date.now();
    // Pre-compute maxMessageCount for normalization (fallback 1)
    let maxMsg = 1;
    threads.forEach(t => {
      const mc = t.metadata?.message_count || t.message_count; // try both
      if (typeof mc === 'number' && mc > maxMsg) maxMsg = mc;
    });
    return threads.map(t => {
      const updatedIso = t.updated_at || t.created_at;
      const updated = new Date(updatedIso);
      const created = new Date(t.created_at);
      const ageDays = Math.max(0, (now - created.getTime()) / 86400000);
      const sinceUpdateHours = (now - updated.getTime()) / 3600000;
      // Recentness score (0 fresh .. 1 stale) invert -> want active = closer to 0 hours
      const recentnessScore = Math.max(0, 1 - Math.min(1, sinceUpdateHours / (24 * 7))); // within a week -> higher activity
      // Volume score based on message_count if present
      const msgCount = typeof t.metadata?.message_count === 'number' ? t.metadata.message_count : (typeof t.message_count === 'number' ? t.message_count : 0);
      const volumeScore = Math.min(1, msgCount / maxMsg);
      // Age dampener: very old threads (>60d) get slight penalty unless recent update
      const agePenalty = ageDays > 60 ? 0.85 : 1;
      const score = (0.65 * recentnessScore + 0.35 * volumeScore) * agePenalty;
      const progress = Math.min(0.95, Math.max(0.05, score));
      const colorScheme = colors[Math.abs(hashString(t.thread_id)) % colors.length] as any;
      return {
        id: t.thread_id,
        title: t.metadata?.title || 'Untitled Thread',
        stage: t.is_public ? 'Public' : 'Private',
        date: updatedIso,
        progress,
        status: 'active' as const,
        daysRemaining: Math.max(1, 30 - Math.round(progress * 30)),
        colorScheme,
        contributors: []
      };
    }).filter(card => {
      if (activeStatus === 'All') return true;
      if (activeStatus === 'Pending') return card.progress < 0.4;
      if (activeStatus === 'Active') return card.progress >= 0.4 && card.progress < 1;
      return true;
    }).filter(card => {
      const d = new Date(card.date);
      return d.getMonth() === activeMonth.getMonth() && d.getFullYear() === activeMonth.getFullYear();
    });
  }, [threads, activeStatus, activeMonth]);

  function hashString(str: string) {
    let h = 0; for (let i=0;i<str.length;i++) { h = (h<<5) - h + str.charCodeAt(i); h |= 0; }
    return h;
  }
  const mockInbox = threads.slice(0,3).map(t => ({
    id: t.thread_id,
    title: t.metadata?.title || 'Thread',
    preview: 'Recent activity placeholder…',
    createdAt: t.updated_at || t.created_at,
    unread: false
  }));
  const mockEvents = [
    { id: 'e1', date: new Date().toISOString(), label: 'Review', color: 'bg-indigo-500' },
    { id: 'e2', date: new Date(Date.now() + 86400000).toISOString(), label: 'Sync', color: 'bg-emerald-500' },
    { id: 'e3', date: new Date(Date.now() + 86400000 * 3).toISOString(), label: 'Deadline', color: 'bg-rose-500' }
  ];

  return (
    <div className="relative mx-auto max-w-7xl px-5 md:px-8 py-8 space-y-10">
      {loading && (
        <div className="p-6 text-sm text-muted-foreground animate-pulse">Loading profile…</div>
      )}
      {!loading && error && (
        <div className="p-6 text-sm text-destructive">{error}</div>
      )}
      {!loading && !error && data && (
        <>
          <StandardHero
            title="Your Profile"
            subtitle="Manage account, usage and settings. Real-time insight into consumption and configuration."
            right={<UsageRing current={subscriptionData?.current_usage ?? data.current_usage} limit={subscriptionData?.cost_limit ?? data.cost_limit} />}
          />
          <FilterTimeframeControls
            statuses={["All","Pending","Active"]}
            activeStatus={activeStatus}
            onStatusChange={setActiveStatus}
            months={[new Date(), new Date(new Date().setMonth(new Date().getMonth()-1))]}
            activeMonth={activeMonth}
            onMonthChange={setActiveMonth}
          />
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-4 space-y-6">
              <ProfileIdentityCard
                user={{ id: data.user_id, name: data.account?.id, role: 'Member', createdAt: data.account?.created_at }}
                account={data.account}
                credentialProfileCount={data.credential_profile_count}
              />
              <InboxPanel messages={mockInbox} loading={threadsLoading} />
            </div>
            <GlassPanel className="md:col-span-8 space-y-6" aria-label="Projects & usage" role="region">
              <div className="space-y-4">
                <h2 className="text-sm font-medium tracking-wide text-muted-foreground/80">Usage & Billing</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard label="Current" value={formatDollar(subscriptionData?.current_usage ?? data.current_usage)} loading={subLoading} accent="primary" />
                  <StatCard label="Limit" value={formatDollar(subscriptionData?.cost_limit ?? data.cost_limit)} loading={subLoading} accent="success" />
                  <StatCard label="Status" value={subscriptionData?.subscription?.cancel_at_period_end ? 'Cancelling' : 'Active'} loading={subLoading} accent="warning" />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowUsageLogs(s => !s)}
                    className="h-8 px-3 text-xs rounded bg-gradient-to-r from-indigo-500 to-emerald-500 text-white shadow hover:opacity-90 transition"
                  >{showUsageLogs ? 'Hide Usage Logs' : 'Show Usage Logs'}</button>
                </div>
                {showUsageLogs && (
                  <div className="mt-6 border rounded-lg p-4 bg-muted/30">
                    <UsageLogs accountId={data.account?.id || ''} />
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <h2 className="text-sm font-medium tracking-wide text-muted-foreground/80">Projects</h2>
                {threadsLoading ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({length:3}).map((_,i)=>(<div key={i} className="h-32 rounded-lg bg-muted/40 animate-pulse" />))}
                  </div>
                ) : (
                  <ProjectSummaryCarousel projects={threadCards} />
                )}
              </div>
            </GlassPanel>
          </div>
          <div className="grid gap-6 md:grid-cols-12">
            <GlassPanel className="md:col-span-4" aria-label="Mini calendar" role="region">
              <h3 className="text-sm font-medium tracking-wide text-muted-foreground/80 mb-4">Calendar</h3>
              <MiniCalendar month={new Date()} selected={new Date()} events={mockEvents} />
            </GlassPanel>
            <GlassPanel className="md:col-span-4 flex flex-col justify-between" aria-label="Settings Link" role="region">
              <div>
                <h2 className="text-sm font-medium tracking-wide text-muted-foreground/80 mb-2">Settings</h2>
                <p className="text-[11px] text-muted-foreground leading-snug mb-4">Manage account, billing, API keys, credentials, environment and appearance in one place.</p>
                <Link href="/settings" className="inline-flex items-center h-8 px-3 text-xs rounded bg-gradient-to-r from-indigo-500 to-emerald-500 text-white shadow hover:opacity-90 transition">Open Unified Settings →</Link>
              </div>
              <div className="mt-4 text-[10px] text-muted-foreground/60">Centralized configuration hub</div>
            </GlassPanel>
            <GlassPanel className="md:col-span-4 space-y-4" aria-label="Account Snapshot" role="region">
              <h3 className="text-sm font-medium tracking-wide text-muted-foreground/80">Account Snapshot</h3>
              <div className="grid gap-2 text-[11px] text-muted-foreground/80">
                <div><span className="font-medium text-foreground">Credential Profiles:</span> {data.credential_profile_count}</div>
                <div><span className="font-medium text-foreground">User ID:</span> {data.user_id}</div>
                <div><span className="font-medium text-foreground">Account ID:</span> {data.account?.id || '—'}</div>
              </div>
            </GlassPanel>
          </div>
          <div className="text-[10px] text-muted-foreground/60 text-center pt-4 pb-2">Profile redesign scaffold · iteration 1</div>
        </>
      )}
    </div>
  );
}

function SettingsCard({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="flex flex-col justify-between rounded-md border p-3 bg-muted/30 hover:bg-muted/40 transition-colors">
      <div>
        <div className="text-xs font-medium mb-0.5">{title}</div>
        <p className="text-[11px] text-muted-foreground leading-snug">{desc}</p>
      </div>
      <span className="mt-3 text-[10px] font-medium text-primary">Open →</span>
    </Link>
  );
}

function LocalEnvCard() {
  if (typeof window === 'undefined') return null;
  const isLocal = window.location.hostname === 'localhost';
  if (!isLocal) return null;
  return (
    <Link href="/settings/env-manager" className="flex flex-col justify-between rounded-md border p-3 bg-muted/30 hover:bg-muted/40 transition-colors">
      <div>
        <div className="text-xs font-medium mb-0.5">Local .Env Manager</div>
        <p className="text-[11px] text-muted-foreground leading-snug">Edit local development environment variables.</p>
      </div>
      <span className="mt-3 text-[10px] font-medium text-primary">Open →</span>
    </Link>
  );
}
