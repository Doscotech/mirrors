'use client';

import React from 'react';
import UsageLogs from '@/components/billing/usage-logs';

export default function SettingsUsageLogsPage() {
  // The UsageLogs component currently doesn't use the accountId prop functionally,
  // but it is required by its interface. We pass an empty string to satisfy types.
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Usage Logs</h1>
        <p className="text-sm text-muted-foreground">Detailed token and cost history for your account.</p>
      </header>

      <UsageLogs accountId="" />
    </div>
  );
}
