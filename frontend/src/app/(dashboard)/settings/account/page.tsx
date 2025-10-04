'use client';
import React from 'react';
import Link from 'next/link';
import { User, Mail, Calendar as CalendarIcon, Shield, Key, CreditCard, ArrowRight, ExternalLink } from 'lucide-react';
import EditPersonalAccountName from '@/components/basejump/edit-personal-account-name';
import { createClient } from '@/lib/supabase/client';
import { MiniCalendar, MiniCalendarEvent } from '@/components/profile/calendar/MiniCalendar';

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
  if (loading) return <div className="h-24 rounded-2xl bg-gradient-to-br from-card/95 to-card/50 backdrop-blur-sm border border-border/40 animate-pulse" />;
  return <EditPersonalAccountName account={personal} />;
}

export default function AccountSettingsPage() {
  const [userEmail, setUserEmail] = React.useState<string>('');
  const [userName, setUserName] = React.useState<string>('');
  const [userId, setUserId] = React.useState<string>('');
  const [triggerEvents, setTriggerEvents] = React.useState<MiniCalendarEvent[]>([]);
  const [calendarMonth, setCalendarMonth] = React.useState(new Date());
  const [profileLoading, setProfileLoading] = React.useState(true);
  const [profileError, setProfileError] = React.useState<string | null>(null);
  const [profileData, setProfileData] = React.useState<{
    user_id: string;
    account: any;
    credential_profile_count: number;
  } | null>(null);

  // Load user auth data
  React.useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
        setUserName(user.user_metadata?.name || user.email?.split('@')[0] || '');
        setUserId(user.id);
      }
    };
    loadUser();
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

  // Fetch upcoming scheduled trigger runs
  React.useEffect(() => {
    // Placeholder: implement when backend endpoint is available
    // setTriggerEvents([{ id:'t1', date:new Date().toISOString(), label:'Trigger', color:'bg-emerald-500' }]);
  }, []);

  return (
    <div className="py-8 space-y-8 max-w-5xl">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Account Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your personal profile, preferences, and account information.
        </p>
      </header>

      {/* Profile Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold mb-4">Profile Information</h2>
        
        <div className="grid gap-4 sm:grid-cols-2">
          {/* User Info Card */}
          <div className="group rounded-2xl bg-gradient-to-br from-card/95 to-card/50 backdrop-blur-sm border border-border/40 p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Display Name</div>
                <div className="text-base font-semibold truncate">{userName || 'Not set'}</div>
              </div>
            </div>
          </div>

          {/* Email Card */}
          <div className="group rounded-2xl bg-gradient-to-br from-card/95 to-card/50 backdrop-blur-sm border border-border/40 p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Mail className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Email Address</div>
                <div className="text-base font-semibold truncate">{userEmail || 'Not set'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Name Editor */}
        <div className="mt-4">
          <AccountNameEditor />
        </div>
      </section>

      {/* Usage & Billing Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold mb-4">Usage & Billing</h2>

        <div className="group rounded-2xl bg-gradient-to-br from-card/95 to-card/50 backdrop-blur-sm border border-border/40 p-6 shadow-sm hover:shadow-md hover:border-emerald-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <CreditCard className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Billing Details</h3>
                <p className="text-sm text-muted-foreground">
                  View detailed usage, spend history and billing status on the Overview dashboard
                </p>
              </div>
            </div>
            <Link 
              href="/overview" 
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 hover:from-emerald-500/20 hover:to-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium transition-all group/link"
            >
              <span className="text-sm">View Dashboard</span>
              <ArrowRight className="h-4 w-4 group-hover/link:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Account Snapshot */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold mb-4">Account Snapshot</h2>

        <div className="rounded-2xl bg-gradient-to-br from-card/95 to-card/50 backdrop-blur-sm border border-border/40 p-6 shadow-sm">
          {profileLoading && (
            <div className="h-24 rounded-xl bg-gradient-to-r from-muted/40 to-muted/20 animate-pulse" />
          )}
          {!profileLoading && profileError && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
              <Shield className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">{profileError}</span>
            </div>
          )}
          {!profileLoading && !profileError && profileData && (
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Credential Profiles */}
              <div className="group/stat rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 p-4 hover:shadow-md hover:border-purple-500/30 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center group-hover/stat:scale-110 transition-transform">
                    <Key className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">Credentials</div>
                </div>
                <div className="text-2xl font-bold">{profileData.credential_profile_count}</div>
                <div className="text-xs text-muted-foreground mt-1">Profile{profileData.credential_profile_count !== 1 ? 's' : ''}</div>
              </div>

              {/* User ID */}
              <div className="group/stat rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 hover:shadow-md hover:border-primary/30 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover/stat:scale-110 transition-transform">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">User ID</div>
                </div>
                <div className="text-xs font-mono truncate">{profileData.user_id}</div>
              </div>

              {/* Account ID */}
              <div className="group/stat rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 p-4 hover:shadow-md hover:border-emerald-500/30 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center group-hover/stat:scale-110 transition-transform">
                    <Shield className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">Account ID</div>
                </div>
                <div className="text-xs font-mono truncate">{profileData.account?.id || '—'}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Scheduled Triggers Calendar */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold mb-4">Scheduled Triggers</h2>

        <div className="rounded-2xl bg-gradient-to-br from-card/95 to-card/50 backdrop-blur-sm border border-border/40 p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Calendar */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-semibold">
                      {calendarMonth.toLocaleString('default', { month: 'long' })} {calendarMonth.getFullYear()}
                    </div>
                    <div className="text-xs text-muted-foreground">Upcoming runs</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                    className="h-8 w-8 rounded-lg bg-muted/40 hover:bg-muted/60 flex items-center justify-center transition-colors"
                  >
                    ←
                  </button>
                  <button 
                    onClick={() => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                    className="h-8 w-8 rounded-lg bg-muted/40 hover:bg-muted/60 flex items-center justify-center transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-background/50 to-background/30 border border-border/40 p-4">
                <MiniCalendar month={calendarMonth} selected={new Date()} events={triggerEvents} />
              </div>
              {triggerEvents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No scheduled runs this month
                </p>
              )}
            </div>

            {/* Information */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-blue-500" />
                  About Scheduled Triggers
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Scheduled triggers you create will appear on the calendar. This view will expand to show upcoming run metadata, execution history, and quick actions to manage your automated workflows.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground">Quick Actions</h4>
                <Link 
                  href="/scheduled" 
                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-muted/40 to-muted/20 hover:from-primary/10 hover:to-primary/5 border border-border/40 hover:border-primary/20 transition-all group/action"
                >
                  <CalendarIcon className="h-5 w-5 text-muted-foreground group-hover/action:text-primary transition-colors" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Manage Scheduled Tasks</div>
                    <div className="text-xs text-muted-foreground">View and configure all your triggers</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover/action:text-primary group-hover/action:translate-x-0.5 transition-all" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
