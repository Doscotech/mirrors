'use client';

import React from 'react';
import { Zap } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';

export const TriggersPageHeader = () => {
  return (
    <PageHeader icon={Zap}>
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Automation Triggers
          </span>
        </h1>
        <p className="text-sm text-muted-foreground/90 md:text-base">
          Keep agents in sync with schedules, events, and webhooks. Design flexible automations that
          run exactly when and where you need them.
        </p>
      </div>
    </PageHeader>
  );
};
