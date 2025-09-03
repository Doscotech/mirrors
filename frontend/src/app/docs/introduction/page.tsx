'use client';

import * as React from 'react';
import { 
  DocsHeader,
  DocsCard,
  DocsBody,
} from '@/components/ui/docs-index';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { ArrowRight, Lightbulb } from 'lucide-react';

const breadcrumbs = [
  { title: 'Documentation', onClick: () => window.location.href = '/docs' },
  { title: 'Introduction' }
];

export default function IntroductionPage() {
  

  return (
    <>
      <DocsHeader
        title="What is Xera?"
        subtitle="A SaaS platform for building and operating AI agents that deliver outcomes"
        breadcrumbs={breadcrumbs}
        lastUpdated="September 2025"
        showSeparator
        size="lg"
        className="mb-8 sm:mb-12"
      />

  {/* Removed legacy banner image */}
    
      <DocsBody className="mb-8">
        <h2 id="overview">What is Xera?</h2>
        <p className="text-lg mb-6">
          Xera is a cloud platform to create, run, and manage AI agents that handle real work. Design agents, connect tools, monitor runs, and deliver outcomes—not prompts.
        </p>

        <h3 id="what-you-can-build" className="mb-4">What can you build?</h3>
        <ul className="list-disc pl-6 mb-6 space-y-1">
          <li>Research and data gathering across the web</li>
          <li>Document and spreadsheet analysis</li>
          <li>Browser automation and scripted actions</li>
          <li>File management and content processing</li>
          <li>Multi-step workflows with approvals</li>
        </ul>

        <h3 id="how-it-works" className="mb-4">How Xera works</h3>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li><strong>Agents</strong> – configurable workers with tools, memory, and policies</li>
          <li><strong>Tools</strong> – safe, scoped capabilities like web, files, email, APIs</li>
          <li><strong>Runs</strong> – traceable executions with logs and artifacts</li>
          <li><strong>Projects</strong> – organize threads, files, and settings</li>
          <li><strong>Observability</strong> – watch steps, retries, costs, and outputs</li>
        </ul>

        <h3 id="why-xera" className="mb-4">Why Xera?</h3>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Outcome-first UX with guardrails and approvals</li>
          <li>Deep integrations and credential management</li>
          <li>Usage-based billing with clear limits</li>
          <li>Team features for collaboration and sharing</li>
        </ul>
      </DocsBody>
      <Separator className="my-6 w-full" />
      <div className='w-full items-center justify-end flex pb-8'>
        <Card onClick={() => window.location.href = '/docs/quick-start'} className="p-2 group rounded-xl w-full lg:w-[400px] hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center gap-2 bg-primary/10 w-12 h-12 rounded-xl">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Quick Start</h3>
            </div>
            <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </Card>
      </div>
    </>
  );
} 