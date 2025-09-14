"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { createClient } from '@/lib/supabase/client';
import { getSubscription } from '@/lib/api';
import UsageLogs from '@/components/billing/usage-logs';
import { StandardHero } from '@/components/layout/StandardHero';
import { GlassPanel } from '@/components/profile/GlassPanel';
import { UsageRing } from '@/components/profile/UsageRing';
import { StatCard } from '@/components/profile/StatCard';

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

  if (loading) return <div className="p-6 text-sm text-muted-foreground animate-pulse">Loading profile…</div>;
  if (error) return <div className="p-6 text-sm text-destructive">{error}</div>;
  if (!data) return null;

  return (
    <div className="relative mx-auto max-w-6xl px-5 md:px-8 py-8 space-y-10">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-blue-400/10 to-emerald-400/10 dark:from-indigo-600/15 dark:via-indigo-500/5 dark:to-emerald-500/15" />
        <div className="absolute top-1/3 -left-24 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-24 w-[28rem] h-[28rem] bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl" />
      </div>

      <StandardHero
        title="Your Profile"
        subtitle="Manage account, usage and settings. Real-time insight into consumption and configuration."
        leftExtra={(
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <div><span className="font-medium text-foreground">User ID:</span> {data.user_id}</div>
            <div><span className="font-medium text-foreground">Account:</span> {data.account?.id || '—'}</div>
            <div><span className="font-medium text-foreground">Created:</span> {data.account?.created_at ? new Date(data.account.created_at).toLocaleDateString() : '—'}</div>
            <div><span className="font-medium text-foreground">Profiles:</span> {data.credential_profile_count}</div>
          </div>
        )}
        right={<UsageRing current={subscriptionData?.current_usage ?? data.current_usage} limit={subscriptionData?.cost_limit ?? data.cost_limit} />}
      />

      <div className="grid gap-6 md:grid-cols-12">
        <GlassPanel className="md:col-span-7 space-y-6">
          <div>
            <h2 className="text-sm font-medium tracking-wide text-muted-foreground/80 mb-3">Usage & Billing</h2>
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
        </GlassPanel>
        <GlassPanel className="md:col-span-5 space-y-5">
          <h2 className="text-sm font-medium tracking-wide text-muted-foreground/80">Quick Settings</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsCard title="Integrations" desc="Manage connected services" href="/settings/credentials" />
            <SettingsCard title="API Keys" desc="Programmatic access" href="/settings/api-keys" />
            <LocalEnvCard />
            <div className="flex flex-col justify-between rounded-md border p-3 bg-muted/30/50">
              <div>
                <div className="text-xs font-medium mb-0.5">Theme</div>
                <p className="text-[11px] text-muted-foreground mb-2 leading-snug">Switch between light & dark modes.</p>
              </div>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="h-8 px-3 text-xs rounded bg-secondary text-secondary-foreground hover:opacity-90 border"
              >Toggle to {theme === 'light' ? 'Dark' : 'Light'}</button>
            </div>
          </div>
          <div className="pt-2 text-[10px] text-muted-foreground/70">Need more? <Link href="/settings/billing" className="text-primary font-medium">Manage billing →</Link></div>
        </GlassPanel>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <GlassPanel className="space-y-4">
          <h3 className="text-sm font-medium tracking-wide text-muted-foreground/80">Account Snapshot</h3>
          <div className="grid gap-2 text-[11px] text-muted-foreground/80">
            <div><span className="font-medium text-foreground">Credential Profiles:</span> {data.credential_profile_count}</div>
            <div><span className="font-medium text-foreground">User ID:</span> {data.user_id}</div>
            <div><span className="font-medium text-foreground">Account ID:</span> {data.account?.id || '—'}</div>
          </div>
        </GlassPanel>
        <GlassPanel className="space-y-4 md:col-span-2">
          <h3 className="text-sm font-medium tracking-wide text-muted-foreground/80">Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/settings/credentials" className="h-8 px-3 rounded bg-muted/40 hover:bg-muted/60 text-xs flex items-center">Manage Integrations</Link>
            <Link href="/settings/api-keys" className="h-8 px-3 rounded bg-muted/40 hover:bg-muted/60 text-xs flex items-center">API Keys</Link>
            <Link href="/settings/billing" className="h-8 px-3 rounded bg-muted/40 hover:bg-muted/60 text-xs flex items-center">Billing</Link>
            <Link href="/settings" className="h-8 px-3 rounded bg-muted/40 hover:bg-muted/60 text-xs flex items-center">All Settings</Link>
          </div>
        </GlassPanel>
        <div className="md:col-span-3 text-[10px] text-muted-foreground/60 text-center pt-4 pb-2">Interface design v2 · enhanced glass & gradients</div>
      </div>
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
