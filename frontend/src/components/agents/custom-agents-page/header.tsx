'use client';

import React from 'react';
import { Bot } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';

export const AgentsPageHeader = () => {
  return (
    <PageHeader icon={Bot}>
      <div className="space-y-2">
        <div className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
          <span className="text-primary">AI Agents</span>
        </div>
      </div>
    </PageHeader>
  );
};
