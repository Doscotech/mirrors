'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import { ComposioConnectionsSection } from '../../../../components/agents/composio/composio-connections-section';
import { StandardHero } from '@/components/layout/StandardHero';

export default function AppProfilesPage() {
  return (
    <div className="w-full">
      <StandardHero
        title="App Credentials"
        subtitle="Manage your third-party app connections and authentication credentials."
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ComposioConnectionsSection />
      </div>
    </div>
  );
} 