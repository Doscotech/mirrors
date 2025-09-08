'use client';

import * as React from 'react';
import { DocsHeader, DocsBody } from '@/components/ui/docs-index';
import { Separator } from '@/components/ui/separator';

const breadcrumbs = [
  { title: 'Documentation', onClick: () => (window.location.href = '/docs') },
  { title: 'Instructions' }
];

export default function InstructionsDocsPage() {
  return (
    <>
      <DocsHeader
        title="Instructions"
        subtitle="Define system prompts, guardrails, and context so agents act predictably."
        breadcrumbs={breadcrumbs}
        lastUpdated="September 2025"
        showSeparator
        size="lg"
        className="mb-8 sm:mb-12"
      />

      <DocsBody>
        <h2 id="overview">Overview</h2>
        <p className="mb-6">
          Instructions control agent behavior: tone, objectives, boundaries, and policies. Combine static guidance with dynamic variables and project context.
        </p>

        <h3 id="system-prompt" className="mt-8 mb-2">System prompt</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Describe the agent’s role, outputs, and decision criteria.</li>
          <li>List non‑negotiable rules and safety boundaries.</li>
          <li>Provide formatting requirements for structured outputs.</li>
        </ul>

        <h3 id="guardrails" className="mt-8 mb-2">Guardrails</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Scope tools to allowed domains and data sets.</li>
          <li>Require confirmation before destructive actions.</li>
          <li>Set max steps, cost ceilings, and timeouts per run.</li>
        </ul>

        <h3 id="variables" className="mt-8 mb-2">Variables and templating</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Inject run‑time variables like project name, user persona, or task goals.</li>
          <li>Use placeholders that resolve from forms, triggers, or API calls.</li>
          <li>Keep prompts deterministic by constraining free‑form inputs.</li>
        </ul>

        <h3 id="context" className="mt-8 mb-2">Context and memory</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Attach knowledge base sources to ground answers with citations.</li>
          <li>Persist short‑term memory within a project thread.</li>
          <li>Reset memory on schedule for compliance or testing.</li>
        </ul>

        <h3 id="best-practices" className="mt-8 mb-2">Best practices</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Prefer explicit checklists; avoid ambiguous directives.</li>
          <li>Constrain output schemas (JSON, tables) for reliable automation.</li>
          <li>Test with edge cases and validate outputs in tooling.</li>
        </ul>
      </DocsBody>
      <Separator className="my-8" />
    </>
  );
}
