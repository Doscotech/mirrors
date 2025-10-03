'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';

export const KnowledgeBasePageHeader = () => {
  return (
    <PageHeader icon={BookOpen}>
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Knowledge Base
          </span>
        </h1>
        <p className="text-sm text-muted-foreground/90 md:text-base">
          Curate, organize, and share reference material with your agents. Upload documents, manage folders,
          and control access from a single, beautifully organized workspace.
        </p>
      </div>
    </PageHeader>
  );
};
