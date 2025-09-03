"use client";

import * as React from "react";
import { DocsHeader, DocsBody } from "@/components/ui/docs-index";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";

const breadcrumbs = [
  { title: "Documentation", onClick: () => (window.location.href = "/docs") },
  { title: "Quick Start" },
];

export default function QuickStartPage() {
  return (
    <>
      <DocsHeader
        title="Quick Start"
        subtitle="Create an account, connect tools, build your first agent, and run a task"
        breadcrumbs={breadcrumbs}
        lastUpdated="September 2025"
        showSeparator
        size="lg"
      />

      <DocsBody>
        <h2 id="create-account">1. Create your Xera account</h2>
        <p>
          Sign up with Google, GitHub, or email. Youll land in the dashboard
          where you can manage projects, agents, and runs.
        </p>

        <h2 id="connect-tools">2. Connect a tool</h2>
        <p>
          Go to Settings  Integrations and connect at least one tool (e.g.,
          Google Drive, Slack, or GitHub). Xera stores credentials securely and
          scopes access to your account.
        </p>

        <h2 id="create-agent">3. Create your first agent</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Name and describe what the agent should accomplish</li>
          <li>Select tools the agent can use</li>
          <li>Choose a model and optional reasoning</li>
          <li>Save the agent and open it in the editor</li>
        </ul>

        <h2 id="run-task">4. Run a task</h2>
        <p>
          From the agent page, start a new thread with a clear instruction. Watch
          each step in the run view, including tool calls, outputs, and costs.
        </p>

        <div className="mt-6 p-4 rounded-lg border bg-card">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Tip</p>
              <p className="text-muted-foreground">
                Keep tasks outcome-focused. Prefer "Draft a summary of the top 3
                articles on X" over "Search the web".
              </p>
            </div>
          </div>
        </div>

        <h2 id="next-steps" className="mt-8">Next steps</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Invite a teammate and share a project</li>
          <li>Add more tools and credentials</li>
          <li>Explore approvals and human-in-the-loop</li>
          <li>Review usage and set limits</li>
        </ul>
      </DocsBody>
      <Separator className="my-6 w-full" />
    </>
  );
}
