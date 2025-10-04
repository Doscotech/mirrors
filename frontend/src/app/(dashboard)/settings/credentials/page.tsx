'use client';

import React, { useState } from 'react';
import { Shield, Plus } from 'lucide-react';
import { ComposioConnectionsSection } from '../../../../components/agents/composio/composio-connections-section';
import { StandardHero } from '@/components/layout/StandardHero';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ComposioRegistry } from '@/components/agents/composio/composio-registry';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AppProfilesPage() {
  const [showRegistry, setShowRegistry] = useState(false);
  const queryClient = useQueryClient();

  const handleProfileCreated = (profileId: string, selectedTools: string[], appName: string, appSlug: string) => {
    setShowRegistry(false);
    queryClient.invalidateQueries({ queryKey: ['composio', 'profiles'] });
    toast.success(`Successfully connected ${appName}!`);
  };

  return (
    <div className="w-full">
      <StandardHero
        title="App Credentials"
        subtitle="Manage your third-party app connections and authentication credentials."
        right={
          <Button
            onClick={() => setShowRegistry(true)}
            className="gap-2 rounded-xl"
          >
            <Plus className="h-4 w-4" />
            Add Credential
          </Button>
        }
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ComposioConnectionsSection />
      </div>

      <Dialog open={showRegistry} onOpenChange={setShowRegistry}>
        <DialogContent className="p-0 max-w-6xl h-[90vh] overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Connect New App</DialogTitle>
          </DialogHeader>
          <ComposioRegistry
            mode="profile-only"
            onClose={() => setShowRegistry(false)}
            onToolsSelected={handleProfileCreated}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 