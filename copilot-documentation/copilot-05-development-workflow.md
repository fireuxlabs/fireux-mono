---
title: Development Workflow
status: draft
created: 2025-10-15
---

# Development Workflow

This chapter describes the standard local workflow, branching expectations, and automation available to FireUX contributors.

## Local Setup

1. Install dependencies: `pnpm install`
2. Run package builds when APIs change: `pnpm build:packages`
3. Launch the relevant dev server:
   - `pnpm dev:fireux` (core showcase)
   - `pnpm dev:misebox` / `pnpm dev:cleanbox` / `pnpm dev:niederhorn`
   - `pnpm dev:all` for multi-app orchestration (long-running background task)
4. Use `.env` values from the root `.env` file (symlinked into project folders). Do not create divergent env files per app.

## Coding Practices

- Keep changes small and scoped to a single feature or fix.
- Run `pnpm lint` and appropriate `pnpm typecheck:*` commands before pushing.
- Add or update package docs in `packages/**/docs/` alongside code changes.
- When introducing new composables or utilities, document usage briefly within the owning package and link from the handbook if cross-cutting.

## Branching & Reviews

- Branch naming: `feature/<topic>`, `fix/<issue>`, or `chore/<task>`.
- Target PRs at `main`. Rebase frequently to keep CI stable.
- Include check results in the PR description (lint, type-check, targeted tests).
- If a change affects shared behaviour or workflow, reference the handbook section updated in the same PR.

## Automation & Scripts

- Migration scripts live in `scripts/`. Many support `--apply` to move from dry-run to write mode.
- Guard scripts under `tools/` enforce structure (e.g. `guard-tsconfigs.mjs`, `guard-shape.mjs`). Run them whenever work touches global config, file placement, or navigation metadata.
- Use `pnpm lint --filter <package>` to focus on specific packages during iteration.
- Record repeatable recipes in the appendices once populated.

## Testing Expectations

- Package-level unit tests should live beside the source (`__tests__` directories) when present.
- End-to-end flows currently rely on manual QA in dev environments; note gaps and propose test coverage in the Operations chapter if incidents recur.
- Scripts performing data changes should log actions and support dry runs where feasible.

Next: see [CI/CD & Releases](./copilot-06-ci-cd.md) for pipeline guidance.
