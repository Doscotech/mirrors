'use client';

import * as React from 'react';
import { DocsHeader, DocsBody } from '@/components/ui/docs-index';
import { Separator } from '@/components/ui/separator';

const breadcrumbs = [
  { title: 'Documentation', onClick: () => (window.location.href = '/docs') },
  { title: 'Triggers' }
];

export default function TriggersDocsPage() {
  return (
    <>
      <DocsHeader
        title="Triggers"
        subtitle="Start agent runs automatically from schedules, webhooks, or app events."
        breadcrumbs={breadcrumbs}
        lastUpdated="September 2025"
        showSeparator
        size="lg"
        className="mb-8 sm:mb-12"
      />

      <DocsBody>
        <h2 id="overview">Overview</h2>
        <p className="mb-6">
          Triggers fire agent workflows without manual input. Use cron‑like schedules, incoming webhooks, or integration events to kick off work reliably.
        </p>

        <h3 id="types" className="mt-8 mb-2">Trigger types</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li><strong>Schedule</strong>: run every N minutes, hourly, daily, or with cron.</li>
          <li><strong>Webhook</strong>: POST a payload to a unique URL to start a run.</li>
          <li><strong>App events</strong>: respond to provider events (e.g., new file, new row).</li>
        </ul>

        <h3 id="inputs" className="mt-8 mb-2">Inputs and mapping</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Define expected inputs for the agent or playbook.</li>
          <li>Map webhook JSON fields or event properties into inputs.</li>
          <li>Provide defaults and validation to prevent bad runs.</li>
        </ul>

        <h3 id="schedules" className="mt-8 mb-2">Schedules</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Supports presets and custom cron expressions.</li>
          <li>Time zones and daylight savings handled automatically.</li>
          <li>Backoff and retry policies configurable per trigger.</li>
        </ul>

        <h3 id="webhooks" className="mt-8 mb-2">Webhooks</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Each trigger gets a unique HTTPS endpoint.</li>
          <li>Send JSON with an Authorization header or secret token.</li>
          <li>Validate signatures for supported providers.</li>
        </ul>

        <h3 id="security" className="mt-8 mb-2">Security</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Rotate webhook secrets regularly; never commit them to code.</li>
          <li>Rate‑limit incoming events to protect agents.</li>
          <li>Use allowlists for IPs if integrating with internal systems.</li>
        </ul>

        <h3 id="monitoring" className="mt-8 mb-2">Monitoring and retries</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>View recent trigger deliveries with status and latency.</li>
          <li>Replay failed deliveries; inspect payload and error message.</li>
          <li>Configure dead‑letter queues for persistent failures.</li>
        </ul>
      </DocsBody>
      <Separator className="my-8" />
    </>
  );
}
