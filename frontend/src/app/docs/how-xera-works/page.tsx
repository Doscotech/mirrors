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

        <h2 id="tools">Tools</h2>
        <p>
          Tools give agents capabilities—like browsing, file I/O, email, or API
          calls. Access is scoped by your credentials. Xera logs every tool call
          for transparency and debugging.
        </p>

        <h2 id="runs">Runs</h2>
        <p>
          A run is the execution of an agent on a task. Runs contain steps,
          inputs, outputs, retries, costs, and artifacts. You can pause for
          approvals or add human feedback as needed.
        </p>

        <h2 id="projects">Projects</h2>
        <p>
          Projects organize threads, files, agents, and settings. Use them to
          separate workstreams and collaborate with your team.
        </p>

        <h2 id="observability">Observability</h2>
        <p>
          Track progress and performance. Inspect step-by-step traces, tool
          outputs, and costs. Export logs for auditing and analysis.
        </p>
      </DocsBody>
      <Separator className="my-6 w-full" />
    </>
  );
}
