# Xera Docs Migration Tracker

Status: In progress
Owner: Web team
Last updated: 2025-09-02

## Scope
Rebrand and reposition documentation from open-source “Suna” to SaaS “Xera”. Focus on how to use the platform, how it works, integrations, security, and operations.

## Milestones
- M1: Branding and nav cleanup (Home + Docs shells)
- M2: Information architecture (IA) redesign for SaaS
- M3: Core guides (Onboarding, Agents, Tools, Workflows)
- M4: Reference (API, Models, Limits, Billing)
- M5: Operations (Security, Compliance, Data, SSO)
- M6: Examples and Tutorials

## Task Board

- [x] Replace “Kortix/Suna” with “Xera” on home hero and navbar
- [x] Remove Open Source/Enterprise nav items from home
- [x] Update docs shell headers from “Suna Docs” to “Xera Docs”
- [ ] Remove remaining open-source language and GitHub CTAs across docs pages
- [ ] Rewrite docs homepage hero for SaaS positioning
- [x] Rewrite docs homepage hero for SaaS positioning
- [x] Draft Quick Start: create account, connect tools, create agent, run task
- [x] Draft “How Xera works”: orchestration, context, tools, runs, observability
- [ ] Draft “Agents”: config, tools, memory, versions, sharing
- [ ] Draft “Workflows”: multi-step, triggers, human-in-the-loop
- [ ] Draft “Integrations”: Composio/Direct, auth flows, scopes, security
- [ ] Draft “Billing & Usage”: plans, tokens, commitments, limits
- [ ] Draft “Security & Data”: storage, PII, encryption, retention
- [ ] Draft “API Reference”: REST endpoints overview and auth
- [ ] Draft “Troubleshooting”: common errors, rate limits, support

## IA Proposal

- Getting Started
  - Introduction
  - Quick Start (SaaS)
  - Concepts (Agents, Projects, Threads, Tools)
- Build
  - Agents (config, prompts, tools)
  - Workflows (steps, triggers, approvals)
  - Files & Knowledge
- Connect
  - Integrations (Google, GitHub, Slack, etc.)
  - Credentials & Secrets
- Operate
  - Runs & Observability
  - Usage & Billing
  - Security & Compliance
- Reference
  - API
  - Limits
  - Changelog

## Content Guidelines
- Avoid “open source”; use “SaaS platform”.
- Use outcome-first language; minimize raw model terminology where not needed.
- Show UI-first flows; include curl only in Reference.
- Keep pages task-oriented with checklists and screenshots.

## Open Questions
- Final logo assets and brand tokens (colors, typography)
- Public API surface and stability guarantees
- Which integrations are GA vs beta

## Next Actions
- [ ] Implement docs homepage copy changes and remove GitHub CTA
- [ ] Build “Quick Start” draft with screenshots placeholders
- [ ] Create Reference stubs and link from sidebar
