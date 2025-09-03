# Chat UI Revamp – Task List (PM Doc)

Status: Draft
Owner: Frontend
Scope: Dashboard chat + Thread view

## Goals
- Sticky chat input at bottom across dashboard and thread pages.
- Center example prompts in the main content when empty.
- Remove “Choose specialized agent” UI in chat input.
- Move model selector to top-left of main content area.

## Tasks

1) Model selector relocation
- Add a shared ModelSelectorBar component (uses useModelSelection + AgentModelSelector)
- Thread pages: render below SiteHeader, sticky under header
- Dashboard: render at very top under app shell
- Acceptance: Changing model updates store and is used for next message

2) Sticky bottom chat input
- Thread: already fixed-bottom; keep behavior
- Dashboard: move ChatInput to a sticky bottom gradient container
- Acceptance: Input remains visible on scroll and does not overlap content

3) Remove specialized agent chooser
- Hide agent selection in ChatInput (hideAgentSelection=true, onAgentSelect undefined)
- Acceptance: No agent dropdown visible in chat input; model menu still present

4) Centered example prompts
- Thread: pass emptyStateComponent with Examples in the center
- Dashboard: Examples remain in center area
- Acceptance: Empty state shows 3–4 prompt chips centered; clicking fills input

5) QA + polish
- Verify mobile breakpoints for sticky containers
- Ensure gradient overlay doesn’t obstruct tool preview snack
- Confirm no double scrollbars

## Risks
- Model menu duplication in both header and input; mitigated by hiding model picker in input later if desired
- Tool preview/snack overlay positioning vs sticky containers

## Follow-ups (nice-to-haves)
- Move model selector out of input menu entirely
- Tiny header strip showing active model + token budget
- Add small helper text in empty state

