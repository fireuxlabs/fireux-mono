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

## Dev env panel

- Location: `http://localhost:<port>/dev` (dev layout landing page). Works across ecosystems; Misebox/Cleanbox keep it job-agnostic.
- Backed by `/api/app/env-check`: validates required client/server env vars, Firebase Admin credentials (JSON, split keys, or service-account file), and brand assets dimensions.
- Panel sections: runtime summary (ecosystem/role/appId/modules), admin SDK status with notes, and optional runtime JSON toggle.
- If status shows `missing`, add the required env keys or provide Firebase Admin credentials using one of these patterns:
   - `GOOGLE_APPLICATION_CREDENTIALS` pointing at the ecosystem convention:
      - `packages/ecosystem/fireux-<ecosystem>/src/config/firebase/service-account.json`
   - Or root env JSON via `FIREBASE_SERVICE_ACCOUNT`.
   - Legacy/alternate file path (still supported in some flows): `projects/<ecosystem>/<ecosystem>-app/config/service-account.json`.
   Run `Refresh` in the panel after fixes.

## Temporary debug panels (clipboard-first)

- Prefer the shared JSON debug component `fireux-core/runtime/components/dev/JsonPanel.vue` ("DevJsonPanel") instead of ad-hoc `<pre>` blocks.
- This panel includes a `Copy JSON` action and an expand/collapse toggle.
- For short-lived debugging, place the panel near the top of the page template for faster access while diagnosing UI state.
- Gate it behind `import.meta.dev` and render it inside `<ClientOnly>`.

## Coding Practices

- Keep changes small and scoped to a single feature or fix.
- Run `pnpm lint` and appropriate `pnpm typecheck:*` commands before pushing.
- Add or update package docs in `packages/**/docs/` alongside code changes.
- When introducing new composables or utilities, document usage briefly within the owning package and link from the handbook if cross-cutting.
- Use `ensureDoc` (`packages/core/fireux-core/src/runtime/composables/fireux/firestore/ensure/useEnsurer.ts`) for new ensure flows; adapters decide targets, payloads, and optional image uploads so storage logic stays consistent.
- For profile pills (professionals/agents), mirror the canonical user fields and the domain subtitle only. Avoid layering new fallbacks or computed decorations without updating this handbook entry.
- Nuxt auto-registers components under `components/` and package `components/` folders; do not re-import them inside `<script setup>` unless a component lives outside the auto-import graph or you opt out intentionally.

## Branching & Reviews

- Branch naming: `feature/<topic>`, `fix/<issue>`, or `chore/<task>`.
- Target PRs at `main`. Rebase frequently to keep CI stable.
- Include check results in the PR description (lint, type-check, targeted tests).
- If a change affects shared behaviour or workflow, reference the handbook section updated in the same PR.

## Automation Toolkit

- Repo automation lives under `scripts/`.
   - Guards: `pnpm guard` runs `scripts/guard.mjs`, which composes checks in `scripts/guards/*.mjs`.
   - Hygiene: `pnpm gitsave` runs `scripts/gitsave.sh` (guarded save + push flow).
   - Maintenance: `pnpm clean` / `pnpm clean:deep` run `scripts/clean.mjs`.
   - App media tooling: `pnpm audit:app-media`, `pnpm sync:app-media-from-public`, etc. map to `scripts/*app-media*.mjs`.
- Prefer `pnpm` scripts over ad-hoc `node scripts/...` so workflows stay consistent across contributors.
- Treat scripts as potentially destructive: skim the file first, and if you add new scripts prefer supporting `--dry-run` + `--apply`.
- Promote repeated recipes into an appendix (see the scripts cheatsheet once it exists).

## Testing Expectations

- Package-level unit tests should live beside the source (`__tests__` directories) when present.
- End-to-end flows currently rely on manual QA in dev environments; note gaps and propose test coverage in the Operations chapter if incidents recur.
- Scripts performing data changes should log actions and support dry runs where feasible.

Next: see [CI/CD & Releases](./copilot-06-ci-cd.md) for pipeline guidance.
