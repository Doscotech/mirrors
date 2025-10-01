# Upstream Sync Playbook

A repeatable checklist for safely merging upstream changes into your fork while preserving and extending your custom design system.

---

## Roles & Ownership
- **Driver** – engineer performing the sync and resolving conflicts.
- **Reviewer** – teammate validating design-system alignment and QA outcomes.

> **Cadence**: Aim for a light-weight sync every 1–2 weeks to minimize divergence.

---

## 1. Pre-flight Checklist
- [ ] Working tree is clean (`git status`).
- [ ] Local main is up to date (`git pull origin main`).
- [ ] Upstream remote exists (`git remote -v`).
- [ ] Dependencies installed / lockfiles up to date.
- [ ] Test suites runnable locally (web, mobile, backend as applicable).

Optional but recommended:
- [ ] Create a safety tag (e.g., `git tag pre-upstream-YYYYMMDD`).
- [ ] Notify team in #dev-updates channel with planned window.

---

## 2. Branch & Fetch
1. **Create merge branch**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b chore/upstream-sync-YYYYMMDD
   ```
2. **Fetch upstream**
   ```bash
   git fetch upstream
   git fetch --tags upstream
   ```

> If `upstream` is missing, add it once via `git remote add upstream <source-url>`.

---

## 3. Reconnaissance (Diff Recon)
- Run `git log origin/main..upstream/main --oneline` to gauge scope.
- Inspect upstream PRs/issues for design-system related changes.
- Flag components/layouts/assets that may collide with local customizations.
- Draft a mini plan for adapting those pieces before merging.

Artifacts:
- Bullet list of impacted areas (e.g., "Dashboard header redesign", "New alert component").
- Notes on required adapters (e.g., "Map upstream `Button` to `@ui/button` with theme colors").

---

## 4. Merge & Resolve
1. Merge upstream:
   ```bash
   git merge upstream/main
   ```
2. Resolve conflicts with design-system priorities:
   - **Do not accept wholesale replacements** that regress your design tokens.
   - Translate upstream styling into local primitives (spacing scale, typography, color tokens).
   - Swap raw CSS/inline styles for your utility classes or styled components.
   - Centralize duplicated logic into shared components where possible.
   - Update Storybook/MDX docs when component APIs shift.
3. Capture conflict resolution notes (per file) for the PR description.

Tip: Use VS Code 3-way diff or `git mergetool` for clarity on both sides.

---

## 5. Refine & Align
- Audit merged UI files for consistency (color, spacing, radii, motion).
- Replace newly introduced assets with equivalents following asset pipeline (naming, optimization, SVG conventions).
- Ensure icons/illustrations adhere to your theme (stroke width, palette).
- Update localization keys if upstream strings changed.
- Sync design tokens (e.g., add `color.alertAccent` if upstream feature requires it).

---

## 6. Quality Gates
Run all applicable automation. Record pass/fail and remediation.

| Area | Command | Status |
| --- | --- | --- |
| Lint | `npm run lint` / `pnpm lint` / `yarn lint` | ☐ |
| Type Check | `tsc --noEmit` / framework equivalent | ☐ |
| Unit Tests | `npm test` / `pnpm test` | ☐ |
| E2E / Integration | `npm run test:e2e` (if exists) | ☐ |
| Build | `next build` / `expo prebuild` / backend build | ☐ |

Backend specific:
- [ ] `pytest`
- [ ] `uv run python run_tests.py`

Mobile specific:
- [ ] `expo-doctor`
- [ ] `npx expo prebuild`

---

## 7. Manual QA
- Spin up each surface (web, mobile, backend admin) with local env vars.
- Validate critical journeys: authentication, dashboards, billing, settings.
- Compare before/after visuals using Storybook/Expo previews.
- Check responsive breakpoints and dark/light modes.
- Note any regressions or TODOs for follow-up issues.

QA log template:
```
Surface: Web dashboard
Scenario: Create project flow
Status: ✅
Notes: New banner matches theme after token swap.
```

---

## 8. Document Outcomes
Prepare PR summary:
- Key upstream features pulled in.
- Notable conflicts and resolution rationale.
- New/updated design tokens or components.
- Test & QA results (table/checklist).
- Follow-up tasks (e.g., "Align new notification badge with mobile variant").

Optional: update `CHANGELOG.md` under "Upstream Sync".

---

## 9. Finalize & Share
1. Verify clean tree: `git status` → no pending conflicts.
2. Commit:
   ```bash
   git commit -am "chore: merge upstream main into fork (YYYY-MM-DD)"
   ```
3. Push & open PR:
   ```bash
   git push origin chore/upstream-sync-YYYYMMDD
   ```
4. Post summary in team channel (link to PR, highlight risks, request design review if needed).
5. After merge:
   ```bash
   git checkout main
   git pull origin main
   git tag -d pre-upstream-YYYYMMDD  # optional cleanup
   ```

---

## 10. Continuous Improvement
- Retrospect after each sync; update this playbook with lessons learned.
- Consider enabling visual regression tests or component-level screenshot testing.
- Automate command sequences with scripts (`scripts/upstream-sync.sh`) once the process stabilizes.

---

## Appendix A – Design-System Harmonization Tips
- Map upstream typography scale to your tokens (e.g., `text-lg` → `fontSizes.md`).
- Normalize spacing: translate pixel values to design spacing multiples.
- Use color aliases instead of hard-coded hex values.
- Centralize new iconography via shared icon library.
- Leverage tokens for shadows, borders, motion to avoid drift.

## Appendix B – Troubleshooting
- **Large conflict areas**: cherry-pick upstream commits selectively, adapt, then merge.
- **Divergent component architectures**: create adapters (e.g., wrapper component) to bridge patterns.
- **Build breaks post-merge**: bisect with `git bisect` using pre/post merge commits.
- **Design regressions**: coordinate with design to capture new Figma references.

---

_Last updated: 2025-10-01_
