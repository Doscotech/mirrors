"use client";

import * as React from "react";
import { DocsHeader, DocsBody } from "@/components/ui/docs-index";
import { Separator } from "@/components/ui/separator";

const breadcrumbs = [
  { title: "Documentation", onClick: () => (window.location.href = "/docs") },
  { title: "How Xera Works" },
];

export default function HowXeraWorksPage() {
  return (
    <>
      <DocsHeader
        title="How Xera Works"
        subtitle="Agents, tools, runs, projects, and observability—how the pieces connect"
        breadcrumbs={breadcrumbs}
        lastUpdated="September 2025"
        showSeparator
        size="lg"
      />

      <DocsBody>
        <h2 id="agents">Agents</h2>
        <p>
          An agent is a configurable worker with purpose, policies, and access to
          tools and data. Give it a description, choose a model, enable memory,
          and select which tools it can use.
        </p>
        <div className="mt-4 grid gap-4">
          <div className="rounded-md border p-4 bg-card">
            <p className="text-sm font-mono mb-2">Example: Research Agent</p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>Purpose: “Summarize the latest LLM eval papers weekly.”</li>
              <li>Model: gpt-4o-mini, Temperature: 0.3, Max steps: 40</li>
              <li>Tools: Web browse, File write, Email send</li>
              <li>Memory: Enabled (remembers sources already covered)</li>
              <li>Guardrails: Require approval before sending emails</li>
            </ul>
          </div>
        </div>

        <h2 id="tools">Tools</h2>
        <p>
          Tools give agents capabilities—like browsing, file I/O, email, or API
          calls. Access is scoped by your credentials. Xera logs every tool call
          for transparency and debugging.
        </p>
        <div className="mt-4 grid gap-4">
          <div className="rounded-md border p-4 bg-card">
            <p className="text-sm font-mono mb-2">Example: Notion + Slack</p>
            <ol className="list-decimal pl-6 space-y-1 text-sm">
              <li>Connect Notion with an internal knowledge base.</li>
              <li>Grant Slack permissions to post in #weekly-research.</li>
              <li>Agent writes a Notion page, then posts a summary link to Slack.</li>
            </ol>
          </div>
        </div>

        <h2 id="runs">Runs</h2>
        <p>
          A run is the execution of an agent on a task. Runs contain steps,
          inputs, outputs, retries, costs, and artifacts. You can pause for
          approvals or add human feedback as needed.
        </p>
        <div className="mt-4 grid gap-4">
          <div className="rounded-md border p-4 bg-card">
            <p className="text-sm font-mono mb-2">Example: Weekly Research Digest</p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>Input: “Draft this week’s LLM eval digest.”</li>
              <li>Steps: Search → Parse papers → Write summary → Await approval → Publish</li>
              <li>Artifacts: Notion page URL, PDF export</li>
              <li>Cost: $0.42 (tokens + tools) • Duration: 2m 10s • Retries: 1</li>
            </ul>
          </div>
        </div>

        <h2 id="projects">Projects</h2>
        <p>
          Projects organize threads, files, agents, and settings. Use them to
          separate workstreams and collaborate with your team.
        </p>
        <div className="mt-4 grid gap-4">
          <div className="rounded-md border p-4 bg-card">
            <p className="text-sm font-mono mb-2">Example: “Website Launch” Project</p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>Agents: PM agent, QA agent, SEO agent</li>
              <li>Files: Sitemap.xlsx, Copy docs, Image assets</li>
              <li>Threads: “SEO tasks”, “QA checklist”, “Content polish”</li>
              <li>Integrations: GitHub, Vercel, Google Search Console</li>
            </ul>
          </div>
        </div>

        <h2 id="observability">Observability</h2>
        <p>
          Track progress and performance. Inspect step-by-step traces, tool
          outputs, and costs. Export logs for auditing and analysis.
        </p>
        <div className="mt-4 grid gap-4">
          <div className="rounded-md border p-4 bg-card">
            <p className="text-sm font-mono mb-2">Example: Debugging a Failed Run</p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>Symptom: “Email step failed: quota exceeded.”</li>
              <li>Action: Open run trace → filter tool calls → expand Email step</li>
              <li>Resolution: Add fallback provider and retry the step</li>
              <li>Outcome: Run completes • total cost unchanged (cached steps)</li>
            </ul>
          </div>
        </div>
      </DocsBody>
      <Separator className="my-6 w-full" />
    </>
  );
}
