"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { createClient } from '@/lib/supabase/client';
import { getSubscription } from '@/lib/api';
import UsageLogs from '@/components/billing/usage-logs';

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

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading...</div>;
  if (error) return <div className="p-6 text-sm text-destructive">{error}</div>;
  if (!data) return null;

  return (
    <div className="p-6 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Profile</h1>
  <p className="text-sm text-muted-foreground mt-1">Manage your account details, usage and settings.</p>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="border rounded-lg p-4">
          <h2 className="font-medium mb-2 text-sm">Account</h2>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div><span className="font-medium text-foreground">User ID:</span> {data.user_id}</div>
            <div><span className="font-medium text-foreground">Account ID:</span> {data.account?.id || '—'}</div>
            <div><span className="font-medium text-foreground">Created:</span> {data.account?.created_at ? new Date(data.account.created_at).toLocaleDateString() : '—'}</div>
          </div>
        </div>
        <div className="border rounded-lg p-4">
            <h2 className="font-medium mb-2 text-sm">Usage</h2>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div><span className="font-medium text-foreground">Current Usage:</span> {formatDollar(data.current_usage)}</div>
              <div><span className="font-medium text-foreground">Cost Limit:</span> {formatDollar(data.cost_limit)}</div>
              <div><span className="font-medium text-foreground">Credential Profiles:</span> {data.credential_profile_count}</div>
            </div>
        </div>
      </section>

      <section className="border rounded-lg p-4 space-y-6">
        <div>
          <h2 className="font-medium mb-3 text-sm">Usage & Billing</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Current Usage" value={formatDollar(subscriptionData?.current_usage ?? data.current_usage)} loading={subLoading} />
            <Stat label="Limit" value={formatDollar(subscriptionData?.cost_limit ?? data.cost_limit)} loading={subLoading} />
            <Stat label="Status" value={subscriptionData?.subscription?.cancel_at_period_end ? 'Cancelling' : 'Active'} loading={subLoading} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setShowUsageLogs(s => !s)}
              className="h-8 px-3 text-xs rounded border bg-muted/40 hover:bg-muted/60"
            >{showUsageLogs ? 'Hide Usage Logs' : 'Show Usage Logs'}</button>
          </div>
          {showUsageLogs && (
            <div className="mt-6">
              <UsageLogs accountId={data.account?.id || ''} />
            </div>
          )}
        </div>
        <div>
          <h2 className="font-medium mb-3 text-sm">Settings</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsCard title="Integrations" desc="Manage connected services" href="/settings/credentials" />
            <SettingsCard title="API Keys" desc="Admin & programmatic access" href="/settings/api-keys" />
            <LocalEnvCard />
            <div className="flex flex-col justify-between rounded-md border p-3 bg-muted/30">
              <div>
                <div className="text-xs font-medium mb-0.5">Theme</div>
                <p className="text-[11px] text-muted-foreground mb-2">Switch between light & dark.</p>
              </div>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="h-8 px-3 text-xs rounded bg-secondary text-secondary-foreground hover:opacity-90"
              >Toggle to {theme === 'light' ? 'Dark' : 'Light'}</button>
            </div>
          </div>
        </div>
      </section>
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

function Stat({ label, value, loading }: { label: string; value: string; loading?: boolean }) {
  return (
    <div className="rounded-md border p-3 bg-muted/30 flex flex-col">
      <span className="text-[11px] text-muted-foreground mb-1 font-medium">{label}</span>
      <span className="text-sm font-semibold tabular-nums">{loading ? '…' : value}</span>
    </div>
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
