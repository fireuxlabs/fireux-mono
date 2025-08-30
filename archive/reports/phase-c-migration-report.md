# FireUX Phase C Migration Report

Date: 2025-08-30

## Engine status

- pnpm: still 9.1.0 detected in this shell. Corepack activation didn't override the global shim. Recommend running:
  - corepack prepare pnpm@10.12.1 --activate
  - pnpm -v (expect 10.x)
  - If still 9.x, ensure your shell rc doesn't alias pnpm; consider `hash -r` or restart terminal.

## Subpath import scan (fireux-core/\*)

- Initial offenders:
  - packages/extensions/fireux-jobs/src/runtime/composables/firestore/objects/Job/useJobCreate.ts (A)
  - packages/extensions/fireux-jobs/src/runtime/composables/firestore/objects/Job/useJobDelete.ts (A)
  - packages/extensions/fireux-jobs/src/runtime/composables/firestore/objects/Job/useJobUpdate.ts (A)
  - packages/extensions/fireux-jobs/src/runtime/composables/firestore/objects/Job/useJobs.ts (A)
  - packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue (A)
  - packages/tenants/fireux-misebox/src/runtime/composables/firestore/core/useMiseApp.ts (A)
  - packages/tenants/fireux-misebox/src/runtime/models/objects/Recipe.model.ts (D - type)

## Migrations applied

- Category A (Composables/Models):
  - Removed deep imports; rely on auto-imports at runtime.
  - Added minimal ambient declarations in `packages/extensions/fireux-jobs/src/runtime/env.d.ts` and a local shim for `#imports` to keep TS aware.
  - Updated CTA.vue to await useApp and drop generic.
- Category D (Other types):
  - Inlined a minimal FirestoreObject interface inside `packages/tenants/fireux-misebox/src/runtime/models/objects/Recipe.model.ts`.

## Counts

- A: 6 files migrated
- B: 0
- C: 0
- D: 1

## Build & typecheck

- Skipped due to pnpm engines mismatch (pnpm 9.x). Once pnpm 10.x is active, run:
  - pnpm -r --filter "./packages/_/_" run clean
  - pnpm -r --filter "./packages/_/_" run build
  - pnpm -r --filter "./projects/_/_" exec nuxi prepare || true
  - pnpm -r exec tsc -b
  - pnpm -r exec vue-tsc --noEmit || true

## Remaining offenders

- After edits, re-scan shows none, but please re-verify after a fresh shell with pnpm 10.x.

## Follow-ups

- Consider adding an ESLint rule to block `fireux-core/*` subpaths.
- Add CI job to grep for deep imports and fail PRs.
