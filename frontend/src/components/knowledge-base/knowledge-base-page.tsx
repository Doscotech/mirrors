'use client';

import React from 'react';
import { KnowledgeBasePageHeader } from './knowledge-base-header';
import { KnowledgeBaseManager } from './knowledge-base-manager';

export function KnowledgeBasePage() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-background via-background/95 to-background">
            <div className="pointer-events-none absolute inset-x-0 top-[-220px] h-[360px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-3xl" />
            <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-4 pb-16 pt-12 sm:px-6 lg:px-8">
                <KnowledgeBasePageHeader />
                <div className="flex-1">
                    <KnowledgeBaseManager
                        showHeader={true}
                        showRecentFiles={true}
                        enableAssignments={false}
                        maxHeight="calc(100vh - 360px)"
                    />
                </div>
            </div>
        </div>
    );
}