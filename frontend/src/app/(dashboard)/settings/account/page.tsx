'use client';
import React from 'react';
import EditPersonalAccountName from '@/components/basejump/edit-personal-account-name';
import { createClient } from '@/lib/supabase/client';

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
  return (
    <div className="py-6 space-y-8">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground">Manage your personal account details.</p>
      </header>
      <AccountNameEditor />
    </div>
  );
}
