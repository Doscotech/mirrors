'use client';

import * as React from 'react';
import { DocsHeader, DocsBody } from '@/components/ui/docs-index';
import { Separator } from '@/components/ui/separator';

const breadcrumbs = [
  { title: 'Documentation', onClick: () => (window.location.href = '/docs') },
  { title: 'Playbooks' }
];

export default function PlaybooksDocsPage() {
  return (
    <>
      <DocsHeader
        title="Playbooks"
        subtitle="Design multi‑step workflows with forms, approvals, and reusable steps."
        breadcrumbs={breadcrumbs}
        lastUpdated="September 2025"
        showSeparator
        size="lg"
        className="mb-8 sm:mb-12"
      />

      <DocsBody>
        <h2 id="overview">Overview</h2>
        <p className="mb-6">
          Playbooks orchestrate repeatable workflows. Define inputs, chain agent steps, call tools, and collect outputs you can ship to downstream systems.
        </p>

        <h3 id="structure" className="mt-8 mb-2">Structure</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li><strong>Inputs</strong>: typed fields users or triggers provide.</li>
          <li><strong>Steps</strong>: agent actions, tool calls, or transformations.</li>
          <li><strong>Outputs</strong>: structured results (JSON, files, links).</li>
        </ul>

        <h3 id="forms" className="mt-8 mb-2">Forms and validation</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Build forms for operators with required fields, defaults, and help text.</li>
          <li>Validate before starting runs to avoid failures mid‑workflow.</li>
        </ul>

        <h3 id="approvals" className="mt-8 mb-2">Approvals and handoffs</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Insert human‑in‑the‑loop checkpoints for sensitive actions.</li>
          <li>Pause and resume runs with full audit trails.</li>
          <li>Escalate to teammates via notifications.</li>
        </ul>

        <h3 id="error-handling" className="mt-8 mb-2">Error handling and retries</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Per‑step retry policy with exponential backoff.</li>
          <li>Fallback branches on tool failure (e.g., alternative provider).</li>
          <li>Dead‑letter outputs for later review.</li>
        </ul>

        <h3 id="reusability" className="mt-8 mb-2">Reusability</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Export/share playbooks across projects or teams.</li>
          <li>Templatize common step groups and variables.</li>
          <li>Version playbooks to track changes over time.</li>
        </ul>
      </DocsBody>
      <Separator className="my-8" />
    </>
  );
}
