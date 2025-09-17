'use client';
import React from 'react';
import Link from 'next/link';

export default function EnvironmentSettingsPage() {
  return (
    <div className="py-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Environment</h1>
        <p className="text-sm text-muted-foreground">Manage local & project environment variables.</p>
      </header>
      <div className="border rounded-md p-4 bg-muted/20 text-sm space-y-3">
        <p>Environment variable management UI is coming soon.</p>
        <p>Visit the <Link href="/settings/env-manager" className="text-primary underline">Env Manager</Link> for the current interface.</p>
      </div>
    </div>
  );
}
