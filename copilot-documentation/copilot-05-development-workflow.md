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
- Use `ensureDoc` (`packages/core/fireux-core/src/runtime/composables/firestore/ensure/useEnsurer.ts`) for new ensure flows; adapters decide targets, payloads, and optional image uploads so storage logic stays consistent.

## Branching & Reviews

- Branch naming: `feature/<topic>`, `fix/<issue>`, or `chore/<task>`.
- Target PRs at `main`. Rebase frequently to keep CI stable.
- Include check results in the PR description (lint, type-check, targeted tests).
- If a change affects shared behaviour or workflow, reference the handbook section updated in the same PR.

## Automation Toolkit

- Scripts now live under `automation/` with focused folders: `automation/migrations/` (with `legacy/` for archived flows), `automation/guards/`, `automation/maintenance/`, plus `automation/vendor/` and `automation/backups/` for external patches and artefacts.
- Migration utilities default to dry runs; enable writes only after reviewing output and, when provided, passing `--apply` or equivalent flags.
- Guard scripts are exposed via `pnpm guard:*`; run them after touching global config, navigation, or asset placement to keep structure checks green.
- Maintenance scripts document their flags at the top of each file (e.g. `scan-deprecated-files.mjs`, `gitsave.sh`); review before executing.
- `pnpm` aliases (e.g. `pnpm migrate:core-users`) target the new paths—prefer them over ad-hoc `tsx` commands.
- Continue to use `pnpm lint --filter <package>` for focused linting, and promote hardened recipes into the appendices.

## Testing Expectations

- Package-level unit tests should live beside the source (`__tests__` directories) when present.
- End-to-end flows currently rely on manual QA in dev environments; note gaps and propose test coverage in the Operations chapter if incidents recur.
- Scripts performing data changes should log actions and support dry runs where feasible.

Next: see [CI/CD & Releases](./copilot-06-ci-cd.md) for pipeline guidance.
