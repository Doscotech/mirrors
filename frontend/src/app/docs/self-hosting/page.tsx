'use client';

import * as React from 'react';
import { 
  DocsHeader,
  DocsCard,
  DocsBody,
} from '@/components/ui/docs-index';
import type { BundledLanguage } from '@/components/ui/shadcn-io/code-block';
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockItem,
} from '@/components/ui/shadcn-io/code-block';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Info, Zap, Lightbulb, ArrowRight, Bot } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import ArchitectureDiagram from '@/components/docs/ArchitectureDiagram';

const breadcrumbs = [
  { title: 'Documentation', onClick: () => window.location.href = '/docs' },
  { title: 'System Deep Dive' }
];

export default function SystemDeepDivePage() {
  return (
    <>
      <DocsHeader
  title="System Deep Dive"
  subtitle="A practical look at how Xera's agents, threads, runs, workers, and queues work together"
        breadcrumbs={breadcrumbs}
        lastUpdated="August 2025"
        showSeparator
        size="lg"
        className="mb-8 sm:mb-12"
      />

      {/* Architecture Deep Dive */}
      <DocsBody className="mb-8">
        <h2 id="architecture-overview">How Xera's Agent System Works</h2>
        <p className="mb-4">
          Xera is built around an event-driven architecture where user actions create <strong>threads</strong> and <strong>runs</strong>,
          which are executed by background <strong>workers</strong> connected to a <strong>queue</strong> (Redis). The UI streams
          token-by-token output as the agent reasons, calls tools, and produces artifacts.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Core Concepts</h3>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Agent</strong>: A configured worker with tools, constraints, memory, and policies.</li>
              <li><strong>Thread</strong>: A conversation timeline tying messages, files, and tool results.</li>
              <li><strong>Run</strong>: A single execution pass of an agent in a thread with a specific goal.</li>
              <li><strong>Tool Calls</strong>: Secure, scoped actions (web, files, email, APIs) invoked by the agent.</li>
              <li><strong>Artifacts</strong>: Outputs like docs, spreadsheets, and exported reports.</li>
            </ul>
            <div className="mt-4 grid gap-3">
              <div className="rounded-md border p-3 bg-card">
                <p className="text-xs font-mono mb-1">Agent Example</p>
                <p className="text-xs text-muted-foreground">“SEO Analyst” using Web Browse + Sheets, memory on, approval before publishing.</p>
              </div>
              <div className="rounded-md border p-3 bg-card">
                <p className="text-xs font-mono mb-1">Thread Example</p>
                <p className="text-xs text-muted-foreground">Messages: kickoff → research results → edits → final approval; files attached: sitemap.xlsx</p>
              </div>
              <div className="rounded-md border p-3 bg-card">
                <p className="text-xs font-mono mb-1">Run Example</p>
                <p className="text-xs text-muted-foreground">Goal: “Generate keywords for 10 pages” • Steps: crawl → cluster → write → review</p>
              </div>
              <div className="rounded-md border p-3 bg-card">
                <p className="text-xs font-mono mb-1">Tool Calls Example</p>
                <p className="text-xs text-muted-foreground">Browse → extract → write to Sheets; all calls logged with params and outputs.</p>
              </div>
              <div className="rounded-md border p-3 bg-card">
                <p className="text-xs font-mono mb-1">Artifacts Example</p>
                <p className="text-xs text-muted-foreground">Generated “keywords.csv” and “strategy.md”, both linked from the run trace.</p>
              </div>
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Execution Flow</h3>
            <ol className="list-decimal pl-6 space-y-2 text-sm">
              <li>User submits a message or workflow trigger starts a <em>run</em>.</li>
              <li>The backend enqueues a job; a background <em>worker</em> picks it up.</li>
              <li>The worker streams tokens back to the UI and performs <em>tool calls</em> as needed.</li>
              <li>State (messages, tool results, costs) is persisted for observability.</li>
              <li>Completion signals the UI and any webhooks or follow-on automations.</li>
            </ol>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Workers & Queues</h3>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Redis</strong> powers pub/sub and job queues for resilient processing.</li>
              <li>Workers handle long-running tasks (multi-step reasoning, scraping, file ops).</li>
              <li>Built-in backoff, retries, and idempotency guards reduce flaky failures.</li>
              <li>Scale horizontally by running more worker processes.</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Tools, Sandboxing, and Safety</h3>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Tools are permissioned and parameterized; calls are logged and auditable.</li>
              <li><strong>Daytona</strong> provides isolated sandboxes for code execution when required.</li>
              <li>Rate limits and cost caps protect budgets and external APIs.</li>
              <li>Structured streaming keeps the UI responsive and transparent.</li>
            </ul>
          </div>
        </div>

        {/* Architecture Diagram */}
        <div className="mt-6 border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Architecture Diagram</h3>
          <p className="text-sm text-muted-foreground mb-3">High-level flow of a run through Xera's system.</p>
          <ArchitectureDiagram className="h-[420px]" />
        </div>
      </DocsBody>
  {/* Removed explicit self-hosting prerequisites; focus on system design */}

  {/* Removed local cloning and setup sections to avoid legacy references */}

  {/* Removed setup wizard specifics; emphasize architecture rather than install steps */}

      <DocsBody className="mb-8">
        <h2 id="platform-components">Behind the Scenes</h2>
        <p className="mb-6">These are the building blocks Xera uses under the hood. You don’t need to set them up—this is here to explain how the system works.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <div className="font-semibold mb-1">Auth & Database</div>
            <p className="text-sm text-muted-foreground">Stores users, conversations, agent configs, and access control.</p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="font-semibold mb-1">Queue</div>
            <p className="text-sm text-muted-foreground">Moves work from the API to background workers reliably (pub/sub + jobs).</p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="font-semibold mb-1">Workers</div>
            <p className="text-sm text-muted-foreground">Execute runs, stream tokens, and call tools with backoff and retries.</p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="font-semibold mb-1">Sandbox</div>
            <p className="text-sm text-muted-foreground">Isolated environments for code execution when an agent needs it.</p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="font-semibold mb-1">LLMs</div>
            <p className="text-sm text-muted-foreground">Reasoning and generation models used by agents during runs.</p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="font-semibold mb-1">Search & Crawling</div>
            <p className="text-sm text-muted-foreground">Find and extract information from the web for research tasks.</p>
          </div>
        </div>
      </DocsBody>

  {/* Database provisioning details omitted; refer users to managed setup or internal runbooks */}

  {/* Removed local run walkthrough; this page now focuses on system behavior */}

      {/* Scaling and Ops */}
      <DocsBody className="mb-8">
        <h2 id="scaling-workers">Scaling Workers</h2>
  <p className="mb-4">For heavier workloads, scale background workers horizontally. Each process pulls jobs from Redis and runs independently.</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Set sensible <strong>timeouts</strong> for long-running tools.</li>
          <li>Use <strong>rate limiting</strong> to protect third-party APIs.</li>
          <li>Monitor Redis memory and connection counts under sustained load.</li>
          <li>Forward <strong>structured logs</strong> to your observability stack.</li>
        </ul>
      </DocsBody>
      <DocsBody className="mb-8">
        <h2 id="tl-dr">TL;DR</h2>
        <p className="mb-2">Submit → API enqueues → Workers execute → Tools run safely → UI streams results.</p>
        <p className="text-muted-foreground">That’s the loop powering agents, with Redis for reliability and Supabase for state.</p>
      </DocsBody>
      <Separator className="my-6 w-full" />
      <div className='w-full items-center justify-end flex pb-8'>
        <Card onClick={() => window.location.href = '/docs/quick-start'} className="p-2 group rounded-xl w-full lg:w-[400px] hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center gap-2 bg-primary/10 w-12 h-12 rounded-xl">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Agent Examples</h3>
            </div>
            <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </Card>
      </div>
    </>
  );
} 