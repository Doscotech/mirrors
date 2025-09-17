'use client';
import React from 'react';
import EmbeddedBilling from '../billing/EmbeddedBilling';

export default function BillingSettingsPage() {
  return (
    <div className="py-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">Usage, credits & subscription management.</p>
      </header>
      <EmbeddedBilling />
    </div>
  );
}
