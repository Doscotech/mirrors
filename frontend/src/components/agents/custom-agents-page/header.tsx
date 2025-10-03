'use client';

import React from 'react';
import { Bot } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';

export const AgentsPageHeader = () => {
  return (
    <PageHeader icon={Bot}>
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            AI Agents
          </span>
        </h1>
        <p className="text-sm text-muted-foreground/90 md:text-base">
          Build tailored assistants with specialized workflows, tools, and behaviors. Assign roles,
          automate processes, and monitor performance in one collaborative hub.
        </p>
      </div>
    </PageHeader>
  );
};
