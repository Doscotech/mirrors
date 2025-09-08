'use client';

import * as React from 'react';
import { DocsHeader, DocsBody } from '@/components/ui/docs-index';
import { Separator } from '@/components/ui/separator';

const breadcrumbs = [
  { title: 'Documentation', onClick: () => (window.location.href = '/docs') },
  { title: 'Integrations' }
];

export default function IntegrationsDocsPage() {
  return (
    <>
      <DocsHeader
        title="Integrations"
        subtitle="Connect external services and give your agents the capabilities they need."
        breadcrumbs={breadcrumbs}
        lastUpdated="September 2025"
        showSeparator
        size="lg"
        className="mb-8 sm:mb-12"
      />

      <DocsBody>
        <h2 id="overview">Overview</h2>
        <p className="mb-6">
          Integrations allow agents to securely act in other systems: browse the web, manage files, send emails, update sheets, or call third‑party APIs. You connect accounts once, then select which agents can use them.
        </p>

        <h3 id="providers-and-tools" className="mt-8 mb-2">Providers and tools</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li><strong>Providers</strong> represent external apps (e.g., Google, Slack, Notion).</li>
          <li><strong>Tools</strong> are scoped capabilities exposed by a provider (e.g., Sheets: read/write, Drive: upload, Slides: export).</li>
          <li>You can enable tools per agent to keep access minimal and auditable.</li>
        </ul>

        <h3 id="authentication" className="mt-8 mb-2">Authentication</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li><strong>OAuth</strong> (recommended): sign in to your account and grant specific scopes.</li>
          <li><strong>API keys</strong>: paste keys or tokens; store them in a credential profile.</li>
          <li><strong>Service accounts</strong>: upload JSON credentials for server‑to‑server access.</li>
        </ul>

        <h3 id="credentials" className="mt-8 mb-2">Credentials: profiles vs connected accounts</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li><strong>Connected accounts</strong> are user‑authorized OAuth connections.</li>
          <li><strong>Credential profiles</strong> are reusable secrets (API keys, service accounts) with a friendly name.</li>
          <li>Assign either to agents or playbooks when configuring tools.</li>
        </ul>

        <h3 id="install-tools" className="mt-8 mb-2">Installing tools for an agent</h3>
        <ol className="list-decimal pl-6 space-y-2 mb-6">
          <li>Open the agent’s configuration.</li>
          <li>Go to Integrations or Tools.</li>
          <li>Select a provider and choose the tools you need.</li>
          <li>Attach a connected account or credential profile.</li>
          <li>Save and test with a sample task.</li>
        </ol>

        <h3 id="security" className="mt-8 mb-2">Security and least privilege</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Grant only the scopes required for a tool.</li>
          <li>Prefer per‑agent accounts for tighter auditing.</li>
          <li>Rotate API keys and revoke unused connections regularly.</li>
        </ul>

        <h3 id="troubleshooting" className="mt-8 mb-2">Troubleshooting</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Re‑authenticate if you see 401/403 errors or expired tokens.</li>
          <li>Verify scopes cover the action the agent tries to perform.</li>
          <li>Check the run logs for the exact provider/tool call and response.</li>
        </ul>
      </DocsBody>
      <Separator className="my-8" />
    </>
  );
}
